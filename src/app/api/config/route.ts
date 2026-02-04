import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory store (volatile on serverless, but works for short-lived spikes)
const tempStorage = new Map<string, { config: string, logo?: string, expires: number }>();

const TURNSTILE_SECRET_KEY = '0x4AAAAAACXenvHBR2zHzCy36OonqAL0SVI';

async function verifyTurnstile(token: string) {
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    body: formData,
    method: 'POST',
  });

  const outcome = await result.json();
  return outcome.success;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'config', 'logo', 'install', or 'challenge'

  // Altcha Challenge Generation (Deprecated - Turnstile handles this client-side)
  if (type === 'challenge') {
    return NextResponse.json({ error: 'Deprecated' }, { status: 410 });
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

    // Verify Turnstile Token
    if (!altchaPayload) {
      return NextResponse.json({ error: 'Captcha required' }, { status: 400 });
    }

    const isValid = await verifyTurnstile(altchaPayload);
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
