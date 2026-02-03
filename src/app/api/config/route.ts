import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createChallenge, verifySolution } from 'altcha-lib';

// In-memory store (volatile on serverless, but works for short-lived spikes)
const tempStorage = new Map<string, { config: string, logo?: string, expires: number }>();

// Simple Altcha Secret (In production, use an environment variable)
const ALTCHA_HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'default_fastfetch_secret_key_123';

// Cleanup expired items every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, data] of tempStorage.entries()) {
      if (now > data.expires) tempStorage.delete(id);
    }
  }, 60000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'config', 'logo', 'install', or 'challenge'

  // Altcha Challenge Generation
  if (type === 'challenge') {
    const challenge = await createChallenge({
        hmacKey: ALTCHA_HMAC_KEY,
        expires: new Date(Date.now() + 300000), // 5 minutes
    });
    return NextResponse.json(challenge);
  }

  if (!id || !tempStorage.has(id)) {
    return new NextResponse('Not found or expired', { status: 404 });
  }

  const data = tempStorage.get(id)!;
  if (Date.now() > data.expires) {
    tempStorage.delete(id);
    return new NextResponse('Expired', { status: 404 });
  }

  if (type === 'config') {
    return new NextResponse(data.config, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (type === 'logo' && data.logo) {
    return new NextResponse(data.logo, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  if (type === 'install') {
    const baseUrl = req.nextUrl.origin;
    const configPath = `~/.config/fastfetch/config.jsonc`;
    const logoPath = `~/.config/fastfetch/logo.txt`;
    
    let script = `mkdir -p ~/.config/fastfetch\n`;
    script += `curl -s "${baseUrl}/api/config?id=${id}&type=config" -o ${configPath}\n`;
    if (data.logo) {
      script += `curl -s "${baseUrl}/api/config?id=${id}&type=logo" -o ${logoPath}\n`;
    }
    script += `echo "Fastfetch configuration installed to ${configPath}"\n`;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new NextResponse('Invalid request', { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const { config, logo, altchaPayload } = await req.json();

    // Verify Altcha Solution
    if (!altchaPayload) {
      return NextResponse.json({ error: 'Captcha required' }, { status: 400 });
    }

    const isValid = await verifySolution(altchaPayload, ALTCHA_HMAC_KEY);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid captcha solution' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
