import { PreviewPlatform } from '@/data/previewProfiles';

/**
 * Browsers expose the host operating-system family, but generally do not
 * expose a Linux distribution. Keep the detection deliberately conservative
 * and let a native Fastfetch capture provide exact host data when available.
 */
export const detectPlatformFromSignals = (signals: string): PreviewPlatform => {
  const normalized = signals.toLowerCase();
  if (/macintosh|mac os|macintel|iphone|ipad|ipod/.test(normalized)) return 'macos';
  if (/windows|win32|win64/.test(normalized)) return 'windows';
  return 'linux';
};

export const detectClientPlatform = (): PreviewPlatform => {
  if (typeof navigator === 'undefined') return 'linux';
  return detectPlatformFromSignals(`${navigator.userAgent} ${navigator.platform}`);
};
