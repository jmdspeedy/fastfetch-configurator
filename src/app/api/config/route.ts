import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_STORAGE_SIZE = 1000; // Cap in-memory storage to prevent OOM
const tempStorage = new Map<string, { config: string, logo?: string, expires: number }>();

// Unique ID for this serverless instance — helps diagnose Vercel instance partitioning
const INSTANCE_ID = Math.random().toString(36).substring(2, 8);
console.log(`[instance:${INSTANCE_ID}] Cold start — tempStorage initialized (empty)`);

function logStorageState(context: string) {
  const keys = Array.from(tempStorage.keys());
  console.log(`[instance:${INSTANCE_ID}] [${context}] Storage size: ${tempStorage.size}, keys: [${keys.join(', ')}]`);
}

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string) {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  try {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (e) {
    console.error('Turnstile verification error:', e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'config', 'logo', 'install'

  /**
   * Helper function to return bash-safe error responses.
   * When the response is piped to bash (e.g., curl ... | bash), plain text errors
   * like "Not found" cause bash to try executing them as commands, resulting in
   * "bash: line 1: Not: command not found". This function returns a proper shell
   * script that echoes the error and exits gracefully.
   */
  const bashSafeError = (message: string, status: number) => {
    const script = `#!/bin/bash\necho "Error: ${message}" >&2\nexit 1\n`;
    return new NextResponse(script, {
      status,
      headers: {
        'Content-Type': 'text/x-shellscript',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  };

  if (!id || typeof id !== 'string' || id.length > 36) {
    return bashSafeError('Invalid ID', 400);
  }

  logStorageState(`GET id=${id}`);
  const data = tempStorage.get(id);

  if (!data) {
    console.warn(`[instance:${INSTANCE_ID}] Config NOT FOUND for id=${id}. This likely means the POST was handled by a different instance.`);
    return bashSafeError('Configuration not found or expired. Please generate a new install command.', 404);
  }
  console.log(`[instance:${INSTANCE_ID}] Config FOUND for id=${id}, expires in ${Math.round((data.expires - Date.now()) / 1000)}s`);

  if (Date.now() > data.expires) {
    tempStorage.delete(id);
    return bashSafeError('Configuration expired. Please generate a new install command.', 404);
  }

  if (type === 'config') {
    return new NextResponse(data.config, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  if (type === 'logo') {
    if (!data.logo) {
      return bashSafeError('No logo for this config', 404);
    }
    return new NextResponse(data.logo, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  if (type === 'install') {
    const baseUrl = req.nextUrl.origin;
    const configPath = `~/.config/fastfetch/config.jsonc`;
    const logoPath = `~/.config/fastfetch/logo.txt`;

    // Sanitize baseUrl to prevent header injection or weird scripts
    const safeBaseUrl = baseUrl.replace(/[^\w\d.:\/-]/g, '');

    let script = `#!/bin/bash\nmkdir -p ~/.config/fastfetch\n`;
    script += `curl -s "${safeBaseUrl}/api/config?id=${id}&type=config" -o ${configPath}\n`;
    if (data.logo) {
      script += `curl -s "${safeBaseUrl}/api/config?id=${id}&type=logo" -o ${logoPath}\n`;
    }
    script += `echo "Fastfetch configuration installed to ${configPath}"\n`;

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'text/x-shellscript',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  return bashSafeError('Invalid request type', 400);
}

export async function POST(req: NextRequest) {
  try {
    // Basic body size limit check (approximate via content-length if available)
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 1024 * 1024) { // 1MB limit
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const body = await req.json();
    const { config, logo, altchaPayload } = body;

    // 1. Validation
    if (typeof config !== 'string' || config.length > 100000) {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }
    if (logo && (typeof logo !== 'string' || logo.length > 100000)) {
      return NextResponse.json({ error: 'Invalid logo' }, { status: 400 });
    }

    // 2. Verify Turnstile Token
    if (!altchaPayload) {
      return NextResponse.json({ error: 'Captcha required' }, { status: 400 });
    }

    const isValid = await verifyTurnstile(altchaPayload);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid captcha solution' }, { status: 400 });
    }

    // 3. Storage Protection: Prevent memory exhaustion
    if (tempStorage.size >= MAX_STORAGE_SIZE) {
      // Simple eviction: remove oldest or just block? 
      // Better to clear expired ones first
      const now = Date.now();
      for (const [key, val] of tempStorage.entries()) {
        if (now > val.expires) tempStorage.delete(key);
      }
      if (tempStorage.size >= MAX_STORAGE_SIZE) {
        return NextResponse.json({ error: 'Server busy, try again later' }, { status: 503 });
      }
    }

    const id = uuidv4().split('-')[0]; // Short ID
    tempStorage.set(id, {
      config,
      logo,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    console.log(`[instance:${INSTANCE_ID}] Config STORED with id=${id}, TTL=300s`);
    logStorageState('POST after store');

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
