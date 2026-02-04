import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_STORAGE_SIZE = 1000; // Cap in-memory storage to prevent OOM
const tempStorage = new Map<string, { config: string, logo?: string, expires: number }>();

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

  if (!id || typeof id !== 'string' || id.length > 36) {
    return new NextResponse('Invalid ID', { status: 400 });
  }

  const data = tempStorage.get(id);
  
  if (!data) {
    return new NextResponse('Not found or expired', { status: 404 });
  }

  if (Date.now() > data.expires) {
    tempStorage.delete(id);
    return new NextResponse('Expired', { status: 404 });
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
    if (!data.logo) return new NextResponse('No logo for this config', { status: 404 });
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

  return new NextResponse('Invalid request', { status: 400 });
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

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
