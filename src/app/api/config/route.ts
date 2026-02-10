import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { gzipSync, gunzipSync } from 'zlib';

// ─── Stateless ID prefix ────────────────────────────────────────────────────
// IDs starting with "s:" contain the full config data (gzipped + base64url).
// This makes the install command completely instance-independent.
const STATELESS_PREFIX = 's:';

// ─── In-memory fallback (for configs too large for URL encoding) ─────────────
const MAX_STORAGE_SIZE = 1000;
const tempStorage = new Map<string, { config: string; logo?: string; expires: number }>();

const INSTANCE_ID = Math.random().toString(36).substring(2, 8);
console.log(`[instance:${INSTANCE_ID}] Cold start — tempStorage initialized (empty)`);

function logStorageState(context: string) {
  const keys = Array.from(tempStorage.keys());
  console.log(`[instance:${INSTANCE_ID}] [${context}] Storage size: ${tempStorage.size}, keys: [${keys.join(', ')}]`);
}

// ─── Turnstile verification ─────────────────────────────────────────────────
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

// ─── Stateless encoding helpers ─────────────────────────────────────────────

/**
 * Encode config + logo into a stateless ID string.
 * Format: "s:" + base64url(gzip(JSON({ c: config, l: logo })))
 * Uses short keys to minimize payload size.
 *
 * @param config - The configuration JSON string
 * @param logo - Optional logo content string
 * @returns The stateless ID string prefixed with "s:"
 */
function encodeStatelessId(config: string, logo?: string): string {
  const payload = JSON.stringify({ c: config, l: logo || undefined });
  const compressed = gzipSync(Buffer.from(payload, 'utf-8'));
  const base64 = compressed.toString('base64url');
  return STATELESS_PREFIX + base64;
}

/**
 * Decode a stateless ID back into config and logo data.
 * Returns null if the ID is malformed or decompression fails.
 *
 * @param id - The full stateless ID string (including "s:" prefix)
 * @returns Decoded config and logo, or null on failure
 */
function decodeStatelessId(id: string): { config: string; logo?: string } | null {
  try {
    const base64 = id.slice(STATELESS_PREFIX.length);
    const compressed = Buffer.from(base64, 'base64url');
    const decompressed = gunzipSync(compressed).toString('utf-8');
    const parsed = JSON.parse(decompressed);
    if (typeof parsed.c !== 'string') return null;
    return { config: parsed.c, logo: parsed.l || undefined };
  } catch {
    return null;
  }
}

/**
 * Check whether a given ID is a stateless (self-contained) ID.
 *
 * @param id - The ID string to check
 * @returns True if the ID contains embedded config data
 */
function isStatelessId(id: string): boolean {
  return id.startsWith(STATELESS_PREFIX);
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Helper function to return bash-safe error responses.
 * When the response is piped to bash (e.g., curl ... | bash), plain text errors
 * like "Not found" cause bash to try executing them as commands, resulting in
 * "bash: line 1: Not: command not found". This function returns a proper shell
 * script that echoes the error and exits gracefully.
 */
function bashSafeError(message: string, status: number) {
  const script = `#!/bin/bash\necho "Error: ${message}" >&2\nexit 1\n`;
  return new NextResponse(script, {
    status,
    headers: {
      'Content-Type': 'text/x-shellscript',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

/**
 * Resolve config data from an ID, supporting both stateless and in-memory IDs.
 * Stateless IDs decode instantly; in-memory IDs look up the tempStorage map.
 *
 * @param id - The config ID (stateless or short UUID)
 * @returns The config data, or null if not found / expired
 */
function resolveConfigData(id: string): { config: string; logo?: string } | null {
  if (isStatelessId(id)) {
    return decodeStatelessId(id);
  }

  // In-memory fallback lookup
  logStorageState(`GET id=${id}`);
  const data = tempStorage.get(id);

  if (!data) {
    console.warn(`[instance:${INSTANCE_ID}] Config NOT FOUND for id=${id}. This likely means the POST was handled by a different instance.`);
    return null;
  }

  console.log(`[instance:${INSTANCE_ID}] Config FOUND for id=${id}, expires in ${Math.round((data.expires - Date.now()) / 1000)}s`);

  if (Date.now() > data.expires) {
    tempStorage.delete(id);
    return null;
  }

  return { config: data.config, logo: data.logo };
}

// ─── GET handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'config', 'logo', 'install'

  if (!id || typeof id !== 'string') {
    return bashSafeError('Invalid ID', 400);
  }

  // Stateless IDs can be long; only enforce length limit on short (in-memory) IDs
  if (!isStatelessId(id) && id.length > 36) {
    return bashSafeError('Invalid ID', 400);
  }

  const data = resolveConfigData(id);
  if (!data) {
    return bashSafeError('Configuration not found or expired. Please generate a new install command.', 404);
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

    // For stateless IDs, the ID is URL-safe (base64url), so it embeds cleanly in curl commands
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

// ─── POST handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Basic body size limit check
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

    // 3. Try stateless encoding first — this makes the command instance-independent
    const statelessId = encodeStatelessId(config, logo);

    // URL length safety check: most servers/browsers handle up to ~8KB URLs.
    // We cap at 6KB to leave room for the base URL and query params.
    const MAX_STATELESS_URL_LENGTH = 6000;
    if (statelessId.length <= MAX_STATELESS_URL_LENGTH) {
      console.log(`[instance:${INSTANCE_ID}] Config encoded as STATELESS ID (${statelessId.length} chars)`);
      return NextResponse.json({ id: statelessId });
    }

    // 4. Fallback: in-memory storage for very large configs
    console.warn(`[instance:${INSTANCE_ID}] Config too large for stateless (${statelessId.length} chars), falling back to in-memory storage`);

    if (tempStorage.size >= MAX_STORAGE_SIZE) {
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

    console.log(`[instance:${INSTANCE_ID}] Config STORED in-memory with id=${id}, TTL=300s`);
    logStorageState('POST after store');

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
