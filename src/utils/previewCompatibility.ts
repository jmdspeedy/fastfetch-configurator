import { DisplayConfig, LogoConfig, ModuleConfig } from '@/store/config';

export const FASTFETCH_VERSION = '2.66.0';

/** The fields intentionally exposed by the simplified editor. */
export const EDITABLE_MODULE_FIELDS = ['key', 'keyColor', 'outputColor'] as const;
export const EDITABLE_DISPLAY_FIELDS = ['separator', 'color'] as const;

export const VERIFIED_MODULE_TYPES = new Set([
  'title', 'separator', 'os', 'host', 'kernel', 'uptime', 'packages', 'shell', 'display', 'de', 'wm', 'wmtheme', 'theme', 'icons', 'font', 'cursor', 'terminal', 'terminalfont', 'cpu', 'gpu', 'memory', 'swap', 'disk', 'battery', 'poweradapter', 'player', 'media', 'localip', 'publicip', 'wifi', 'datetime', 'locale', 'vulkan', 'opengl', 'opencl', 'users', 'bluetooth', 'sound', 'gamepad', 'weather', 'netio', 'diskio', 'physicaldisk', 'version', 'break', 'colors', 'command', 'file', 'codec', 'bios', 'bluetoothradio', 'board', 'bootmgr', 'brightness', 'btrfs', 'camera', 'chassis', 'cpucache', 'cpuusage', 'custom', 'text', 'dns', 'editor', 'initsystem', 'keyboard', 'lm', 'loadavg', 'logo', 'monitor', 'mouse', 'physicalmemory', 'processes', 'terminalsize', 'terminaltheme', 'tpm', 'wallpaper', 'zpool',
]);

export interface PreviewSupport {
  supported: boolean;
  features: string[];
}

export function assessPreviewSupport(
  modules: ModuleConfig[],
  logo: LogoConfig,
  _display: DisplayConfig,
  general: Record<string, unknown> = {},
): PreviewSupport {
  void general;
  const features: string[] = [];
  modules.forEach((module) => {
    const type = String(module.type || '').toLowerCase().replace(/[-_]/g, '');
    if (!VERIFIED_MODULE_TYPES.has(type)) features.push(`module type "${module.type}"`);
  });
  if (['sixel', 'kitty', 'kitty-direct', 'kitty-icat', 'iterm', 'chafa', 'raw', 'command-raw', 'file-raw'].includes(String(logo.type)) && !logo._customContent) {
    features.push(`${logo.type} logo output without captured logo text`);
  }
  return { supported: features.length === 0, features: [...new Set(features)] };
}
