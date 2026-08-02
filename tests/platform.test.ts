import { describe, expect, test } from 'vitest';
import { detectPlatformFromSignals } from '@/utils/platform';

describe('browser platform detection', () => {
  test('detects Windows', () => {
    expect(detectPlatformFromSignals('Mozilla/5.0 Windows NT 10.0 Win64; x64 Win32')).toBe('windows');
  });

  test('detects macOS and Apple mobile user agents', () => {
    expect(detectPlatformFromSignals('Mozilla/5.0 Macintosh; Intel Mac OS X 10_15_7 MacIntel')).toBe('macos');
    expect(detectPlatformFromSignals('Mozilla/5.0 iPad CPU OS 17_0 like Mac OS X')).toBe('macos');
  });

  test('uses Linux as the fallback for Linux and unknown platforms', () => {
    expect(detectPlatformFromSignals('Mozilla/5.0 X11; Linux x86_64')).toBe('linux');
    expect(detectPlatformFromSignals('')).toBe('linux');
  });
});
