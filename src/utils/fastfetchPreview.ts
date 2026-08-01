import { getFormatPlaceholders, getDummyValues } from '@/data/moduleFormatStrings';
import { defaultPreviewProfile, PreviewProfile } from '@/data/previewProfiles';
import { DisplayConfig, LogoConfig, ModuleConfig } from '@/store/config';
import { stripTerminalControls } from '@/utils/terminalBuffer';

export interface PreviewSegment {
  text: string;
  color?: string;
  background?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface PreviewLine {
  id: string;
  kind: 'module' | 'title' | 'separator' | 'break' | 'colors' | 'custom' | 'diagnostic';
  moduleType: string;
  key?: string;
  separator?: string;
  output?: string;
  segments: PreviewSegment[];
  keyColor?: string;
  outputColor?: string;
  separatorColor?: string;
  keyWidth?: number;
  colorBlocks?: { index: number; background: string; text: string }[];
}

export interface PreviewDiagnostic {
  level: 'info' | 'warning' | 'error';
  message: string;
  moduleId?: string;
}

export interface PreviewModel {
  profile: PreviewProfile;
  lines: PreviewLine[];
  diagnostics: PreviewDiagnostic[];
  terminalStream: string;
  unsupportedFeatures: string[];
}

type ColorConfig = DisplayConfig['color'];

const LABELS: Record<string, string> = {
  os: 'OS', host: 'Host', kernel: 'Kernel', uptime: 'Uptime', packages: 'Packages', shell: 'Shell',
  display: 'Display', de: 'DE', wm: 'WM', wmtheme: 'WM Theme', theme: 'Theme', icons: 'Icons', font: 'Font',
  cursor: 'Cursor', terminal: 'Terminal', terminalfont: 'Terminal Font', cpu: 'CPU', gpu: 'GPU', memory: 'Memory',
  swap: 'Swap', disk: 'Disk', battery: 'Battery', poweradapter: 'Power Adapter', player: 'Player', media: 'Media',
  localip: 'Local IP', publicip: 'Public IP', wifi: 'Wifi', datetime: 'Date & Time', locale: 'Locale', vulkan: 'Vulkan',
  opengl: 'OpenGL', opencl: 'OpenCL', users: 'Users', bluetooth: 'Bluetooth', sound: 'Sound', gamepad: 'Gamepad',
  weather: 'Weather', netio: 'Network IO', diskio: 'Disk IO', physicaldisk: 'Physical Disk', version: 'Version', bios: 'BIOS',
  bluetoothradio: 'Bluetooth Radio', board: 'Board', bootmgr: 'Boot Manager', brightness: 'Brightness', btrfs: 'Btrfs',
  camera: 'Camera', chassis: 'Chassis', cpucache: 'CPU Cache', cpuusage: 'CPU Usage', dns: 'DNS', editor: 'Editor',
  initsystem: 'Init System', keyboard: 'Keyboard', lm: 'Login Manager', loadavg: 'Load Average', monitor: 'Monitor',
  mouse: 'Mouse', physicalmemory: 'Physical Memory', processes: 'Processes', terminalsize: 'Terminal Size',
  terminaltheme: 'Terminal Theme', tpm: 'TPM', wallpaper: 'Wallpaper', zpool: 'Zpool', codec: 'Codec',
};

const KEY_ICONS: Record<string, string> = {
  os: '', host: '󰇅', kernel: '', uptime: '󰅐', packages: '󰏖', shell: '', display: '󰍹',
  de: '󰧨', wm: '󰖲', cpu: '󰻠', gpu: '󰢮', memory: '󰍛', disk: '󰋊', battery: '󰁹',
  terminal: '', wifi: '󰖩', localip: '󰩟', bluetooth: '󰂯', sound: '󰕾', users: '󰀄',
};

const DEFAULT_FORMATS: Record<string, string> = {
  os: '{pretty-name} {arch}', host: '{name} {version}', kernel: '{sysname} {release}', uptime: '{formatted}',
  packages: '{all}', shell: '{pretty-name} {version}', display: '{width}x{height} @ {scale-factor}x in {inch}"{?refresh-rate}, {refresh-rate} Hz{?}{?type} [{type}]{?}',
  de: '{pretty-name}{?version} {version}{?}', wm: '{pretty-name}{?version} {version}{?}', wmtheme: '{result}', theme: '{theme1}', icons: '{icons1}',
  font: '{combined}', cursor: '{theme}', terminal: '{pretty-name} {version}', terminalfont: '{combined}',
  cpu: '{name} ({cores-logical}) @ {freq-max}', gpu: '{name}{?frequency} @ {frequency}{?}{?dedicated-total} ({dedicated-total}){?}{?type} [{type}]{?}', memory: '{used} / {total} ({percentage}%)', swap: '{used} / {total} ({percentage}%)',
  disk: '{size-used} / {size-total} ({size-percentage}%) - {filesystem}', battery: '{capacity}% [{status}]', poweradapter: '{watts}W',
  player: '{player}', media: '{combined}', localip: '{ipv4}', publicip: '{ip}', wifi: '{ssid} ({signal-quality}%)',
  datetime: '{year}-{month-pretty}-{day-pretty} {hour-pretty}:{minute-pretty}:{second-pretty}', locale: '{result}',
  vulkan: '{driver} {api-version}', opengl: '{version} ({renderer})', opencl: '{version} ({name})', users: '{name}',
  bluetooth: '{name} ({connected})', sound: '{name} ({platform-api})', gamepad: '{name}', weather: '{result}',
  netio: '↓ {rx-size} ↑ {tx-size}', diskio: '↓ {size-read} ↑ {size-written}', physicaldisk: '{name} ({size})',
  version: '{project-name} {version} ({arch})', bios: '{vendor} {version}', bluetoothradio: '{name} ({version})',
  board: '{vendor} {name}', bootmgr: '{name}', brightness: '{percentage}%', btrfs: '{name}: {used} / {total}',
  camera: '{name} ({width}x{height})', chassis: '{type}', cpucache: '{result}', cpuusage: '{avg}%', dns: '{result}',
  editor: '{name} ({version})', initsystem: '{name} {version}', keyboard: '{name}', lm: '{service}',
  loadavg: '{loadavg1}, {loadavg2}, {loadavg3}', monitor: '{name} ({width}x{height} @ {refresh-rate}Hz)',
  mouse: '{name}', physicalmemory: '{size} {type}', processes: '{result}', terminalsize: '{columns}x{rows}',
  terminaltheme: '{bg-type}', tpm: '{version} ({description})', wallpaper: '{full-path}', zpool: '{name}: {used} / {total}',
  codec: '{gpu} ({direction})',
};

const normalizeType = (type: string) => type.toLowerCase().replace(/[-_]/g, '');

const isCaptureProfile = (profile: PreviewProfile) => profile.source === 'capture' || profile.label.toLowerCase().includes('capture');

const displayColor = (color: ColorConfig, name: 'keys' | 'title' | 'output' | 'separator', fallback: string) => {
  if (typeof color === 'string') return color;
  return color?.[name] || fallback;
};

const moduleColor = (value: unknown, fallback: string) => typeof value === 'string' && value ? value : fallback;

const trimRendered = (value: string) => value.replace(/[ \t]+\n/g, '\n').trimEnd();

function formatBytes(value: number, digits: number): string {
  if (!Number.isFinite(value)) return '';
  if (value < 1024) return `${Math.round(value)} B`;
  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let amount = value;
  let unit = 'B';
  for (const candidate of units) {
    amount /= 1024;
    unit = candidate;
    if (Math.abs(amount) < 1024 || candidate === units[units.length - 1]) break;
  }
  return `${amount.toFixed(digits)} ${unit}`;
}

function applyDisplayFormatting(moduleType: string, values: Record<string, string>, display: DisplayConfig): Record<string, string> {
  const next = { ...values };
  const size = (display.size || {}) as Record<string, unknown>;
  const freq = (display.freq || {}) as Record<string, unknown>;
  const sizeDigits = typeof size.ndigits === 'number' ? size.ndigits : 2;
  const freqDigits = typeof freq.ndigits === 'number' ? freq.ndigits : 2;
  const freqSpace = String(freq.spaceBeforeUnit ?? (display as Record<string, unknown>).freqSpaceBeforeUnit ?? 'default').toLowerCase() === 'never' ? '' : ' ';
  for (const field of ['used', 'total', 'free', 'available', 'dedicated-total', 'dedicated-used', 'shared-total', 'shared-used', 'size-used', 'size-total', 'size-free', 'size-available']) {
    const raw = next[`${field}-bytes`] || next[`bytes-${field}`];
    if (raw && /^\d+(?:\.\d+)?$/.test(raw)) next[field] = formatBytes(Number(raw), sizeDigits);
  }
  for (const field of ['freq-base', 'freq-max', 'frequency']) {
    const raw = next[`${field}-mhz`];
    if (raw && /^\d+(?:\.\d+)?$/.test(raw)) next[field] = `${(Number(raw) / 1000).toFixed(freqDigits)}${freqSpace}GHz`;
  }
  if (moduleType === 'physicalmemory' && next.bytes && /^\d+(?:\.\d+)?$/.test(next.bytes)) next.size = formatBytes(Number(next.bytes), sizeDigits);
  return next;
}

type PercentSettings = { number: boolean; bar: boolean; hideOthers: boolean; digits: number; width: number; spaceBeforeUnit: boolean; elapsedChar: string; totalChar: string; borderLeft: string; borderRight: string };

function percentSettings(moduleConfig: ModuleConfig, display: DisplayConfig): PercentSettings {
  const displayAny = display as Record<string, unknown>;
  const modulePercent = (moduleConfig.percent || {}) as Record<string, unknown>;
  const displayPercent = (displayAny.percent || {}) as Record<string, unknown>;
  const displayBar = (displayAny.bar || {}) as Record<string, unknown>;
  const barChars = (displayBar.char || {}) as Record<string, unknown>;
  const barBorder = (displayBar.border || {}) as Record<string, unknown>;
  const rawType = modulePercent.type ?? displayPercent.type ?? displayAny.percentType;
  const type = String(rawType ?? 'num').toLowerCase();
  const number = typeof rawType === 'number'
    ? Boolean(rawType & 1)
    : type.includes('num') || type === 'both' || type === 'default';
  const bar = typeof rawType === 'number'
    ? Boolean(rawType & 2)
    : type.includes('bar') || type === 'both';
  const hideOthers = typeof rawType === 'number'
    ? Boolean(rawType & 4)
    : type.includes('hide') || type === 'only';
  const digits = Number(modulePercent.ndigits ?? displayPercent.ndigits ?? displayAny.percentNdigits ?? 0);
  const spaceBeforeUnit = String(modulePercent.spaceBeforeUnit ?? displayPercent.spaceBeforeUnit ?? displayAny.percentSpaceBeforeUnit ?? 'default').toLowerCase() === 'always';
  const width = Number(modulePercent.width ?? displayPercent.width ?? displayBar.width ?? displayAny.barWidth ?? 10);
  return {
    number,
    bar,
    hideOthers,
    digits: Number.isFinite(digits) ? Math.max(0, digits) : 0,
    width: Number.isFinite(width) ? Math.max(1, width) : 10,
    spaceBeforeUnit,
    elapsedChar: String(barChars.elapsed ?? '█'),
    totalChar: String(barChars.total ?? '-'),
    borderLeft: String(barBorder.left ?? '[ '),
    borderRight: String(barBorder.right ?? ' ]'),
  };
}

function formatPercent(value: string | undefined, settings: PercentSettings, parentheses = false): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  const result = `${number.toFixed(settings.digits)}${settings.spaceBeforeUnit ? ' ' : ''}%`;
  return parentheses ? `(${result})` : result;
}

function formatPercentBar(value: string | undefined, settings: PercentSettings): string {
  const number = Math.max(0, Math.min(100, Number(value)));
  if (!Number.isFinite(number)) return '';
  const elapsed = Math.round((number / 100) * settings.width);
  return `${settings.borderLeft}${settings.elapsedChar.repeat(elapsed)}${settings.totalChar.repeat(Math.max(0, settings.width - elapsed))}${settings.borderRight}`;
}

function percentOutput(value: string | undefined, settings: PercentSettings): string {
  const parts: string[] = [];
  if (settings.bar) parts.push(formatPercentBar(value, settings));
  if (settings.number) parts.push(formatPercent(value, settings, settings.bar));
  return parts.join(' ');
}

function valueIsTrue(value: string | undefined): boolean {
  return value === 'true' || value === '1' || value === 'yes' || value === 'enabled';
}

function rounded(value: string | undefined): string {
  const number = Number(value);
  return Number.isFinite(number) ? String(Math.round(number)) : '';
}

function nativeDefaultOutput(type: string, values: Record<string, string>, module: ModuleConfig, display: DisplayConfig, resultIndex: number, resultCount: number): string | undefined | null {
  const get = (...names: string[]) => names.map((name) => values[name]).find((value) => value !== undefined && value !== '') || '';
  const optional = (left: string, right: string, suffix = '') => left ? `${left}${right}${suffix}` : '';
  const percent = percentSettings(module, display);
  switch (type) {
    case 'os': {
      let result = get('pretty-name', 'name');
      if (!result) result = get('sysname');
      const arch = get('arch') || '';
      if (arch && !result.toLowerCase().includes(arch.toLowerCase())) result = `${result} ${arch}`.trim();
      return result;
    }
    case 'host': {
      const result = get('name', 'family');
      return optional(result, get('version') ? ' (' : '', get('version') ? `${get('version')})` : '');
    }
    case 'kernel': return `${get('sysname')} ${get('release')}`.trim();
    case 'uptime': return get('formatted');
    case 'datetime': return get('result') || `${get('year')}-${get('month-pretty', 'month')}-${get('day-pretty', 'day-in-month')} ${get('hour-pretty', 'hour')}:${get('minute-pretty', 'minute')}:${get('second-pretty', 'second')}`.trim();
    case 'packages': {
      const packageNames: Record<string, string> = {
        'am-system': 'am-system', 'am-user': 'am-user', appimage: 'appimage', apk: 'apk',
        brew: 'brew', 'brew-all': 'brew', 'brew-cask': 'brew-cask', cards: 'cards', choco: 'choco',
        dpkg: 'dpkg', emerge: 'emerge', eopkg: 'eopkg', 'flatpak-all': 'flatpak',
        flatpak: 'flatpak', 'flatpak-system': 'flatpak', 'flatpak-user': 'flatpak-user',
        'guix-all': 'guix', 'guix-home': 'guix-home', 'guix-system': 'guix-system', 'guix-user': 'guix-user',
        'hpkg-all': 'hpkg', 'hpkg-system': 'hpkg-system', 'hpkg-user': 'hpkg-user',
        'install-release': 'install-release', kiss: 'kiss', linglong: 'linglong', lpkg: 'lpkg',
        lpkgbuild: 'lpkgbuild', macports: 'macports', mport: 'mport', moss: 'moss',
        'nix-all': 'nix', nix: 'nix', 'nix-default': 'nix-default', 'nix-system': 'nix-system', 'nix-user': 'nix-user',
        opkg: 'opkg', pacman: 'pacman', 'pacman-branch': 'pacman-branch', pacstall: 'pacstall',
        paludis: 'paludis', pisi: 'pisi', pkg: 'pkg', pkgsrc: 'pkgsrc', pkgtool: 'pkgtool', porg: 'porg',
        rpm: 'rpm', 'scoop-global': 'scoop-global', 'scoop-user': 'scoop-user', snap: 'snap',
        soar: 'soar', sorcery: 'sorcery', winget: 'winget', xbps: 'xbps',
      };
      const packages = Object.entries(values).filter(([key, value]) => key !== 'all' && packageNames[key] && Number(value) > 0).map(([key, value]) => `${value} (${packageNames[key]})`);
      return packages.length ? packages.join(', ') : null;
    }
    case 'loadavg': return `${get('loadavg1')}, ${get('loadavg2')}, ${get('loadavg3')}`;
    case 'shell': return `${get('pretty-name', 'process-name')} ${get('version')}`.trim();
    case 'bootmgr': return `${get('name')}${get('firmware-name') ? ` - ${get('firmware-name')}` : ''}`;
    case 'bluetoothradio': {
      const lmpVersion = Number(get('lmp-version'));
      const lmpToBluetooth: Record<number, string> = { 0: '1.0', 1: '1.1', 2: '1.2', 3: '2.0', 4: '2.1', 5: '3.0', 6: '4.0', 7: '4.1', 8: '4.2', 9: '5.0', 10: '5.1', 11: '5.2', 12: '5.3', 13: '5.4', 14: '5.4' };
      const version = get('version') || lmpToBluetooth[lmpVersion] || '';
      return version ? `Bluetooth ${version}${get('vendor') ? ` (${get('vendor')})` : ''}` : get('vendor');
    }
    case 'codec': {
      const types = [get('types'), ...Object.entries(values).filter(([key]) => /^types-\d+$/.test(key)).map(([, value]) => value)].filter(Boolean);
      return types.length ? types.join(', ') : 'None';
    }
    case 'de': return `${get('pretty-name')} ${get('version')}`.trim();
    case 'wm': {
      let result = `${get('pretty-name')} ${get('version')}`.trim();
      if (get('protocol-name')) result += ` (${get('protocol-name')})`;
      if (get('plugin-name')) result += ` (with ${get('plugin-name')})`;
      return result;
    }
    case 'wmtheme': return get('result');
    case 'theme': return [get('theme1'), get('theme2')].filter(Boolean).join(', ');
    case 'icons': return [get('icons1'), get('icons2')].filter(Boolean).join(', ');
    case 'font': return get('combined', 'font1');
    case 'cursor': return get('theme');
    case 'terminal': return `${get('pretty-name', 'process-name')} ${get('version')}`.trim();
    case 'terminalfont': return get('combined', 'pretty');
    case 'diskio': return `${get('size-read')}${get('size-read') && !get('size-read').endsWith('/s') ? '/s' : ''} (R) - ${get('size-written')}${get('size-written') && !get('size-written').endsWith('/s') ? '/s' : ''} (W)`;
    case 'netio': return `${get('rx-size')}${get('rx-size') && !get('rx-size').endsWith('/s') ? '/s' : ''} (IN) - ${get('tx-size')}${get('tx-size') && !get('tx-size').endsWith('/s') ? '/s' : ''} (OUT)`;
    case 'physicaldisk': {
      const flags = [get('physical-type'), get('removable-type')].filter(Boolean);
      return `${get('size')}${flags.length ? ` [${flags.join(', ')}]` : ''}${get('temperature') ? ` - ${get('temperature')}` : ''}`.trim();
    }
    case 'publicip': return get('location') ? `${get('ip')} (${get('location')})` : get('ip');
    case 'sound': {
      let result = percent.hideOthers ? '' : get('name');
      if (get('volume-percentage')) result = `${result}${result ? ' ' : ''}${percent.number ? formatPercent(get('volume-percentage'), percent, Boolean(result)) : ''}`.trim();
      return result;
    }
    case 'gamepad': case 'bluetooth': {
      const battery = get('battery-percentage');
      let result = percent.hideOthers ? '' : get('name');
      if (battery && percent.number) result = `${result}${result ? ' ' : ''}${formatPercent(battery, percent, Boolean(result))}`.trim();
      if (type === 'bluetooth' && !valueIsTrue(get('connected'))) result += ' [disconnected]';
      return result;
    }
    case 'brightness': return `${percentOutput(get('percentage'), percent)}${get('is-builtin') ? (valueIsTrue(get('is-builtin')) ? ' [Built-in]' : ' [External]') : ''}`.trim();
    case 'btrfs': return `${get('used')} / ${get('total')} (${formatPercent(get('used-percentage'), percent)}, ${formatPercent(get('allocated-percentage'), percent)} allocated)`;
    case 'cpucache': return get('result', 'sum');
    case 'cpuusage': return percentOutput(get('avg'), percent);
    case 'dns': return get('result');
    case 'editor': return `${get('exe-name', 'exe', 'name')} ${get('version') ? `(${get('version')})` : ''}`.trim();
    case 'initsystem': return `${get('name')} ${get('version')}`.trim();
    case 'keyboard': return get('name');
    case 'lm': return `${get('service')} ${get('version')}${get('type') ? ` (${get('type')})` : ''}`.trim();
    case 'monitor': {
      let result = `${get('width')}x${get('height')} px`;
      if (get('refresh-rate')) result += ` @ ${get('refresh-rate')} Hz`;
      if (get('physical-width') && get('physical-height')) {
        const physicalWidth = Number(get('physical-width'));
        const physicalHeight = Number(get('physical-height'));
        const diagonalInches = Math.sqrt(physicalWidth ** 2 + physicalHeight ** 2) / 25.4;
        const pixelDiagonal = Math.sqrt(Number(get('width')) ** 2 + Number(get('height')) ** 2);
        const inch = Number.isFinite(diagonalInches) ? diagonalInches : Number(get('inch'));
        const ppi = Number.isFinite(pixelDiagonal) && inch > 0 ? pixelDiagonal / inch : Number(get('ppi'));
        result += ` - ${get('physical-width')}x${get('physical-height')} mm${Number.isFinite(inch) ? ` (${inch.toFixed(2)} inches` : ''}${Number.isFinite(ppi) ? `, ${ppi.toFixed(2)} ppi)` : Number.isFinite(inch) ? ')' : ''}`;
      }
      if (valueIsTrue(get('hdr-compatible'))) result += ' [HDR Compatible]';
      return result;
    }
    case 'mouse': return get('name');
    case 'opengl': case 'opencl': return get('version');
    case 'terminaltheme': {
      const normalizeHex = (value: string) => value.startsWith('#') ? value.toUpperCase() : value;
      return `${normalizeHex(get('fg-color'))} (FG) - ${normalizeHex(get('bg-color'))} (BG) [${get('bg-type') || 'Unknown'}]`;
    }
    case 'zpool': return `${get('used')} / ${get('total')} (${formatPercent(get('used-percentage'), percent)}, ${formatPercent(get('allocated-percentage'), percent)} allocated, ${formatPercent(get('fragmentation-percentage'), percent)} frag) - ${get('state')}${valueIsTrue(get('is-readonly', 'read-only')) ? ' [Read-only]' : ''}`;
    case 'display': {
      const width = get('width');
      const height = get('height');
      if (!width || !height) return '';
      let result = `${width}x${height}`;
      const dpi = Number(get('dpi'));
      const scale = Number(get('scale-factor'));
      if ((Number.isFinite(dpi) && dpi !== 96) || (Number.isFinite(scale) && scale > 0 && scale !== 1)) {
        const ndigits = Number((display as Record<string, unknown>).fractionNdigits ?? 2);
        const factor = Number.isFinite(dpi) && dpi > 0 ? dpi / 96 : scale;
        result += ` @ ${factor.toFixed(Number.isFinite(ndigits) ? ndigits : 2).replace(/0+$/, '').replace(/\.$/, '')}x`;
      }
      const inch = rounded(get('inch'));
      if (inch && Number(inch) > 1) result += ` in ${inch}"`;
      const refresh = Number(get('refresh-rate'));
      if (Number.isFinite(refresh) && refresh > 0) {
        const precise = Boolean(module.preciseRefreshRate);
        result += `, ${precise ? refresh.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') : Math.round(refresh)} Hz`;
      }
      const displayType = get('type');
      let flag = false;
      if (displayType && displayType.toLowerCase() !== 'unknown') { result += ` [${displayType}`; flag = true; }
      if (valueIsTrue(get('hdr-enabled')) || get('hdr-status').toLowerCase() === 'enabled') { result += flag ? ', HDR' : ' [HDR'; flag = true; }
      if (flag) result += ']';
      if (resultCount > 1 && valueIsTrue(get('is-primary', 'primary'))) result += ' *';
      return result;
    }
    case 'cpu': {
      let result = get('name', 'cpu');
      if (!result) result = get('vendor') ? `${get('vendor')} CPU` : 'Unknown';
      const cores = get('core-types') || get('cores-online');
      if (cores && Number(cores) > 1 || (cores && cores.includes('+'))) result += ` (${cores})`;
      const frequency = get('freq-max', 'freq-base');
      if (frequency) result += ` @ ${frequency}`;
      if (get('temperature')) result += ` - ${get('temperature')}`;
      return result;
    }
    case 'gpu': {
      const vendor = get('vendor');
      const name = get('name');
      let result = vendor && name && !name.toLowerCase().startsWith(vendor.toLowerCase()) ? `${vendor} ${name}` : name || vendor;
      if (get('core-count') && get('core-count') !== '0') result += ` (${get('core-count')})`;
      if (get('frequency')) result += ` @ ${get('frequency')}`;
      if (get('temperature')) result += ` - ${get('temperature')}`;
      if (get('dedicated-total') && get('dedicated-total') !== '0 B') {
        const memory = percent.hideOthers ? '' : [get('dedicated-used'), get('dedicated-total')].filter(Boolean).join(' / ');
        const memoryPercent = get('dedicated-percentage-num') || (() => {
          const used = Number(get('dedicated-used-bytes')); const total = Number(get('dedicated-total-bytes'));
          return total > 0 ? String(Math.round((used / total) * 100)) : '';
        })();
        const suffix = [memory, percent.number && memoryPercent ? formatPercent(memoryPercent, percent) : '', percent.bar && memoryPercent ? formatPercentBar(memoryPercent, percent) : ''].filter(Boolean).join(', ');
        result += ` (${suffix})`;
      }
      if (get('type') && get('type').toLowerCase() !== 'unknown') result += ` [${get('type')}]`;
      return result;
    }
    case 'memory': {
      const total = get('total');
      if (!total || total === '0 B') return 'Disabled';
      const parts: string[] = [];
      if (percent.bar) parts.push(formatPercentBar(get('percentage'), percent));
      if (!percent.hideOthers) parts.push(`${get('used')} / ${total}`);
      if (percent.number) parts.push(formatPercent(get('percentage'), percent, !percent.hideOthers && parts.length > 0));
      return parts.join(' ').trim();
    }
    case 'swap': {
      const total = get('total');
      if (!total || total === '0 B') return percent.hideOthers ? percentOutput('0', percent) : (get('name') ? 'Unused' : 'Disabled');
      const parts: string[] = [];
      if (percent.bar) parts.push(formatPercentBar(get('percentage'), percent));
      if (!percent.hideOthers) parts.push(`${get('used')} / ${total}`);
      if (percent.number) parts.push(formatPercent(get('percentage'), percent, !percent.hideOthers && parts.length > 0));
      return parts.join(' ').trim();
    }
    case 'disk': {
      const total = get('size-total', 'total');
      const used = get('size-used', 'used');
      let result = total && total !== '0 B' ? `${percent.bar ? `${formatPercentBar(get('size-percentage'), percent)} ` : ''}${percent.hideOthers ? '' : `${used} / ${total} `}${percent.number ? `${formatPercent(get('size-percentage'), percent, !percent.hideOthers)} ` : ''}` : 'Unknown ';
      if (!percent.hideOthers) {
        if (get('filesystem')) result += `- ${get('filesystem')} `;
        const flags = [valueIsTrue(get('is-external')) ? 'External' : '', valueIsTrue(get('is-subvolume')) ? 'Subvolume' : '', valueIsTrue(get('is-hidden')) ? 'Hidden' : '', valueIsTrue(get('is-readonly')) ? 'Read-only' : ''].filter(Boolean);
        if (flags.length) result += `[${flags.join(', ')}]`;
      }
      return result.trim();
    }
    case 'battery': {
      const parts: string[] = [];
      const capacity = get('capacity');
      if (capacity) {
        if (percent.bar) parts.push(formatPercentBar(capacity, percent));
        if (percent.number) parts.push(formatPercent(capacity, percent));
        if (get('time-formatted')) parts[parts.length - 1] = `${parts[parts.length - 1] || ''} (${get('time-formatted')} remaining)`;
      }
      if (!percent.hideOthers && get('status')) parts.push(`[${get('status')}]`);
      if (get('temperature')) parts.push(`- ${get('temperature')}`);
      return parts.join(' ').trim();
    }
    case 'poweradapter': return get('name') || (get('watts') ? `${get('watts')}W` : '');
    case 'localip': {
      const parts = [get('ipv4'), get('ipv6')].filter(Boolean);
      if (get('mac')) parts.push(parts.length ? `(${get('mac')})` : get('mac'));
      const network = [get('speed') ? `Speed ${get('speed')}` : '', get('mtu') ? `MTU ${get('mtu')}` : ''].filter(Boolean).join(' / ');
      if (network) parts.push(`[${network}]`);
      if (get('flags')) parts.push(`<${get('flags')}>`);
      return parts.join(' ');
    }
    case 'bios': return `${get('version')} ${get('release') ? `(${get('release')})` : ''}`.trim();
    case 'board': return `${get('name')} ${get('version') ? `(${get('version')})` : ''}`.trim();
    case 'chassis': return `${get('type')} ${get('version') ? `(${get('version')})` : ''}`.trim();
    case 'camera': return `${get('name')}${get('colorspace') ? ` - ${get('colorspace')}` : ''}${Number(get('width')) > 0 && Number(get('height')) > 0 ? ` (${get('width')}x${get('height')} px)` : ''}`;
    case 'version': return `${get('project-name')} ${get('version')}${get('version-tweak')}${get('build-type') === 'debug' ? '-debug' : ''} (${get('arch')})`.trim();
    case 'vulkan': return get('api-version') && get('driver') ? `${get('api-version')} - ${get('driver')}` : (get('instance-version') ? `${get('instance-version')} [Software only]` : get('api-version', 'driver'));
    case 'wallpaper': return get('file-name', 'full-path');
    case 'tpm': return get('description', 'version');
    case 'users': return `${get('name')}${get('host-name') ? `@${get('host-name')}` : ''}${get('login-time') ? ` - login time ${get('login-time')}` : ''}`;
    case 'physicalmemory': {
      if (get('is-installed') === 'false' || get('installed') === 'false') return `Empty${get('form-factor') ? ` - ${get('form-factor')}` : ''}${get('locator') ? ` (${get('locator')})` : ''}`;
      const size = get('size');
      let result = size ? `${size} - ${get('type')}` : get('type');
      if (get('max-speed')) result += `-${get('max-speed')}`;
      if (get('running-speed') && get('running-speed') !== get('max-speed')) result += ` @ ${get('running-speed')} MT/s`;
      if (get('vendor')) result += ` (${get('vendor')})`;
      if (valueIsTrue(get('is-ecc-enabled', 'ecc'))) result += ' - ECC';
      return result.trim();
    }
    case 'terminalsize': {
      let result = `${get('columns')} columns x ${get('rows')} rows`;
      if (get('width') && get('height') && get('width') !== '0' && get('height') !== '0') result += ` (${get('width')}px x ${get('height')}px)`;
      return result;
    }
    case 'processes': return get('result');
    case 'weather': case 'locale': return get('result', 'ip');
    case 'media': return get('combined', 'title');
    case 'player': return get('player', 'name');
    case 'wifi': return get('ssid')
      ? `${get('ssid')}${get('protocol') ? ` - ${get('protocol')}` : ''}${get('security') ? ` - ${get('security')}` : ''}`.trim()
      : get('inf-status', 'status');
    default: return undefined;
  }
}

function getModuleValues(moduleType: string, profile: PreviewProfile, display: DisplayConfig): Record<string, string> {
  const type = normalizeType(moduleType);
  const captured = profile.values[type];
  const selected = Array.isArray(captured) ? captured[0] || {} : captured || {};
  const base = isCaptureProfile(profile) ? {} : getDummyValues(moduleType);
  const values = { ...base, ...selected };
  if (type === 'os' && !values.arch) values.arch = profile.architecture;
  if (type === 'kernel' && !values.sysname && values.name) values.sysname = values.name;
  return applyDisplayFormatting(type, values, display);
}

function getModuleValueSets(moduleType: string, profile: PreviewProfile, display: DisplayConfig): Record<string, string>[] {
  const type = normalizeType(moduleType);
  const success = profile.succeeded?.[type];
  const direct = profile.values[type];
  const directIsEmpty = direct === undefined || (Array.isArray(direct) ? direct.length === 0 : Object.keys(direct).length === 0);
  const captured = type === 'monitor' && (directIsEmpty || success === false) ? profile.values.display : direct;
  if (isCaptureProfile(profile) && captured === undefined && (success === undefined || success === false)) return [];
  const values = Array.isArray(captured)
    ? captured.filter((_item, index) => !(Array.isArray(success) && success[index] === false) && !(type === 'gamepad' && !_item.name?.trim()))
    : (success === false && type !== 'monitor' ? [] : [captured || {}]);
  const base = isCaptureProfile(profile) ? {} : getDummyValues(moduleType);
  const mapped = values.map((item) => {
    const next = { ...base, ...item };
    if (type === 'os' && !next.arch) next.arch = profile.architecture;
    if (type === 'kernel' && !next.sysname && next.name) next.sysname = next.name;
    return applyDisplayFormatting(type, next, display);
  });
  const usable = type === 'gamepad' ? mapped.filter((item) => Boolean(item.name?.trim()) && !item.name.includes('\uFFFD')) : mapped;
  if (type === 'diskio') return usable.sort((left, right) => {
    const a = String(left.name || '');
    const b = String(right.name || '');
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return usable;
}

function evaluateConditions(module: ModuleConfig, profile: PreviewProfile): boolean {
  const condition = module.condition as Record<string, unknown> | undefined;
  if (!condition) {
    if (isCaptureProfile(profile)) {
      const captured = profile.succeeded?.[normalizeType(module.type)];
      if (captured === false && !(normalizeType(module.type) === 'monitor' && profile.values.display !== undefined)) return false;
    }
    return true;
  }
  const system = profile.id === 'macos' ? 'macOS' : profile.id === 'windows' ? 'Windows' : 'Linux';
  const check = (value: unknown, actual: string) => Array.isArray(value)
    ? value.some((item) => String(item).toLowerCase() === actual.toLowerCase())
    : String(value).toLowerCase() === actual.toLowerCase();
  if (condition.system && !check(condition.system, system)) return false;
  if (condition['!system'] && check(condition['!system'], system)) return false;
  if (condition.arch && !check(condition.arch, profile.architecture)) return false;
  if (condition['!arch'] && check(condition['!arch'], profile.architecture)) return false;
  // A fixture is a successful detection unless the capture explicitly reports otherwise.
  if (typeof condition.succeeded === 'boolean') {
    const captured = profile.succeeded?.[normalizeType(module.type)];
    const actual = Array.isArray(captured) ? captured.some(Boolean) : captured ?? true;
    if (actual !== condition.succeeded) return false;
  }
  return true;
}

function replaceFormatTokens(format: string, moduleType: string, values: Record<string, string>, display: DisplayConfig, general: Record<string, unknown>, diagnostics: PreviewDiagnostic[], moduleId: string): string {
  let source = format.replace(/\{\{/g, '\u0000').replace(/\}\}/g, '\u0001');
  const placeholders = getFormatPlaceholders(moduleType);
  let implicitIndex = 0;
  const valueFor = (name: string) => {
    if (name === '') return valueFor(String(++implicitIndex));
    if (/^-?\d+$/.test(name)) {
      const index = Number(name);
      const position = index < 0 ? placeholders.length + index : index - 1;
      const placeholder = placeholders[position];
      return placeholder ? values[placeholder.placeholder] ?? '' : '';
    }
    if (name === 'succeeded') return values.succeeded || 'true';
    if (name.startsWith('$')) {
      const displayConstants = (display as DisplayConfig & { constants?: unknown }).constants;
      const generalConstants = general.constants;
      const constants = Array.isArray(displayConstants) ? displayConstants : Array.isArray(generalConstants) ? generalConstants : [];
      const constantIndex = Number(name.slice(1));
      return Number.isFinite(constantIndex) ? String(constants[constantIndex] ?? constants[Math.max(0, constantIndex - 1)] ?? '') : '';
    }
    return values[name] ?? '';
  };

  // Fastfetch conditional blocks: {?value}...{?} and {/value}...{/}.
  // Resolve them recursively so nested optional sections behave like the native parser.
  const renderConditionals = (input: string): string => {
    let output = '';
    let index = 0;
    while (index < input.length) {
      const marker = input.slice(index).match(/^\{([?\/])([^}]*)\}/);
      if (!marker) {
        output += input[index++];
        continue;
      }
      const kind = marker[1];
      const name = marker[2];
      if (!name) { index += marker[0].length; continue; }
      const bodyStart = index + marker[0].length;
      let cursor = bodyStart;
      let depth = 1;
      let closeStart = -1;
      while (cursor < input.length) {
        const nested = input.slice(cursor).match(/^\{([?\/])([^}]*)\}/);
        if (!nested) { cursor += 1; continue; }
        const nestedKind = nested[1];
        const nestedName = nested[2];
        if (nestedKind === kind && nestedName) depth += 1;
        else if (nestedKind === kind && !nestedName) {
          depth -= 1;
          if (depth === 0) { closeStart = cursor; cursor += nested[0].length; break; }
        }
        cursor += nested[0].length;
      }
      if (closeStart < 0) { output += input.slice(index); break; }
      const body = renderConditionals(input.slice(bodyStart, closeStart));
      const enabled = Boolean(valueFor(name));
      if ((kind === '?' && enabled) || (kind === '/' && !enabled)) output += body;
      index = cursor;
    }
    return output;
  };
  source = renderConditionals(source);
  const terminateAt = source.indexOf('{ - }'.replace(' ', ''));
  if (terminateAt >= 0) source = source.slice(0, terminateAt);

  source = source.replace(/\{([^{}]+)\}/g, (match, name: string) => {
    if (name.startsWith('#')) return match;
    const result = valueFor(name);
    if (result === '' && !name.startsWith('$')) {
      // Empty values are legitimate in Fastfetch. Keep the token out of output,
      // but retain a diagnostic for names that are not known to this profile.
      if (!values[name] && !/^\d+$/.test(name)) diagnostics.push({ level: 'info', message: `No sample value for {${name}}`, moduleId });
    }
    return result;
  });
  return source.replace(/\u0000/g, '{').replace(/\u0001/g, '}');
}

function styledSegments(value: string, defaults: PreviewSegment): PreviewSegment[] {
  const segments: PreviewSegment[] = [];
  let current: PreviewSegment = { ...defaults, text: '' };
  const push = (text: string) => { if (text) segments.push({ ...current, text }); };
  const ansi = /\x1b\[([0-9;]*)m/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = ansi.exec(value))) {
    push(value.slice(last, match.index));
    const codes = match[1].split(';').filter(Boolean).map(Number);
    if (codes.length === 0 || codes.includes(0)) current = { ...defaults, text: '' };
    for (let codeIndex = 0; codeIndex < codes.length; codeIndex++) {
      const code = codes[codeIndex];
      if (code === 1) current.bold = true;
      if (code === 2) current.dim = true;
      if (code === 3) current.italic = true;
      if (code === 4) current.underline = true;
      if (code === 22) { current.bold = false; current.dim = false; }
      if (code === 23) current.italic = false;
      if (code === 24) current.underline = false;
      if (code >= 30 && code <= 37) current.color = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'][code - 30];
      if (code >= 90 && code <= 97) current.color = ['bright_black', 'bright_red', 'bright_green', 'bright_yellow', 'bright_blue', 'bright_magenta', 'bright_cyan', 'bright_white'][code - 90];
      if (code >= 40 && code <= 47) current.background = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'][code - 40];
      if (code >= 100 && code <= 107) current.background = ['bright_black', 'bright_red', 'bright_green', 'bright_yellow', 'bright_blue', 'bright_magenta', 'bright_cyan', 'bright_white'][code - 100];
      if (code === 39) current.color = defaults.color;
      if (code === 49) current.background = defaults.background;
      if ((code === 38 || code === 48) && codes[codeIndex + 1] === 2) {
        const rgb = codes.slice(codeIndex + 2, codeIndex + 5);
        if (rgb.length === 3) {
          const value = `#${rgb.map((part) => Math.max(0, Math.min(255, part)).toString(16).padStart(2, '0')).join('')}`;
          if (code === 38) current.color = value; else current.background = value;
        }
        codeIndex += 4;
      } else if ((code === 38 || code === 48) && codes[codeIndex + 1] === 5) {
        const palette = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];
        const paletteIndex = codes[codeIndex + 2];
        const value = paletteIndex < 16 ? palette[paletteIndex] : undefined;
        if (value) { if (code === 38) current.color = value; else current.background = value; }
        codeIndex += 2;
      }
    }
    last = match.index + match[0].length;
  }
  push(value.slice(last));
  return segments;
}

function ansiCodeForColor(color: string): string {
  const named: Record<string, string> = { black: '30', red: '31', green: '32', yellow: '33', blue: '34', magenta: '35', cyan: '36', white: '37', default: '39' };
  if (/^\d+(;\d+)*$/.test(color)) return color;
  if (color.startsWith('#') && /^#[0-9a-f]{6}$/i.test(color)) {
    return `38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}`;
  }
  const prefixes: string[] = [];
  let rest = color;
  let bright = false;
  for (const prefix of ['bold_', 'bright_', 'light_', 'dim_', 'italic_', 'underline_', 'blink_', 'inverse_']) {
    if (rest.startsWith(prefix)) {
      if (prefix === 'bright_' || prefix === 'light_') bright = true;
      else prefixes.push(prefix === 'bold_' ? '1' : prefix === 'italic_' ? '3' : prefix === 'underline_' ? '4' : prefix === 'dim_' ? '2' : prefix === 'blink_' ? '5' : '7');
      rest = rest.slice(prefix.length);
    }
  }
  const base = named[rest] || '39';
  const brightCode = bright && /^3[0-7]$/.test(base) ? String(Number(base) + 60) : base;
  return [...prefixes, brightCode].join(';');
}

function renderFormat(format: string, moduleType: string, values: Record<string, string>, display: DisplayConfig, general: Record<string, unknown>, diagnostics: PreviewDiagnostic[], moduleId: string, baseColor: string): { text: string; segments: PreviewSegment[] } {
  const resolved = replaceFormatTokens(format, moduleType, values, display, general, diagnostics, moduleId);
  if (display.pipe === true) {
    const text = trimRendered(stripTerminalControls(resolved.replace(/\{#[^}]*\}/g, '')));
    return { text, segments: text ? [{ text, color: 'default' }] : [] };
  }
  const colorized = resolved.replace(/\{#([^}]*)\}/g, (_match, color: string) => {
    const namedColor = color === 'keys' || color === 'title' || color === 'output' || color === 'separator'
      ? displayColor(display.color, color, baseColor)
      : color;
    return `\x1b[${namedColor === '' ? '0' : ansiCodeForColor(namedColor)}m`;
  });
  return { text: trimRendered(stripTerminalControls(resolved.replace(/\{#[^}]*\}/g, ''))), segments: styledSegments(colorized, { text: '', color: baseColor }) };
}

function segmentAnsi(segment: PreviewSegment): string {
  const codes: string[] = [];
  if (segment.bold) codes.push('1');
  if (segment.dim) codes.push('2');
  if (segment.italic) codes.push('3');
  if (segment.underline) codes.push('4');
  if (segment.color) codes.push(ansiCodeForColor(segment.color));
  if (segment.background) codes.push(ansiCodeForColor(segment.background).replace(/^38/, '48'));
  return codes.length > 0 ? `\x1b[0;${codes.join(';')}m` : '\x1b[0m';
}

function linesToTerminalStream(lines: PreviewLine[]): string {
  return lines.map((line) => {
    if (line.kind === 'break') return '';
    if (line.kind === 'colors') {
      return (line.colorBlocks || []).map((block) => {
        const rgb = /^#([0-9a-f]{6})$/i.exec(block.background);
        return `${rgb ? `\x1b[48;2;${parseInt(rgb[1].slice(0, 2), 16)};${parseInt(rgb[1].slice(2, 4), 16)};${parseInt(rgb[1].slice(4, 6), 16)}m` : ''}${block.text}\x1b[0m`;
      }).join('');
    }
    return line.segments.map((segment) => `${segmentAnsi(segment)}${segment.text}`).join('');
  }).join('\n');
}

export function buildPreviewModel(
  modules: ModuleConfig[],
  logo: LogoConfig,
  display: DisplayConfig,
  profile: PreviewProfile = defaultPreviewProfile,
  general: Record<string, unknown> = {},
): PreviewModel {
  const diagnostics: PreviewDiagnostic[] = [];
  const unsupportedFeatures: string[] = [];
  if (!profile.label.toLowerCase().includes('capture')) {
    diagnostics.push({ level: 'info', message: `Deterministic ${profile.label} sample; load a native Fastfetch JSON capture for host-exact values` });
  }
  if (['sixel', 'kitty', 'kitty-direct', 'kitty-icat', 'iterm', 'chafa'].includes(String(logo.type)) && !logo._customContent) {
    const message = `${logo.type} logo protocol requires a native terminal or loaded capture`;
    diagnostics.push({ level: 'error', message });
    unsupportedFeatures.push(message);
  }
  if (['command-raw', 'file-raw', 'raw'].includes(String(logo.type)) && !logo._customContent) {
    const message = 'Raw logo source is not available in the browser; load the logo text or a native capture';
    diagnostics.push({ level: 'error', message });
    unsupportedFeatures.push(message);
  }
  const keyColor = display.pipe === true ? 'default' : displayColor(display.color, 'keys', 'blue');
  const titleColor = display.pipe === true ? 'default' : displayColor(display.color, 'title', keyColor);
  const outputColor = display.pipe === true ? 'default' : displayColor(display.color, 'output', 'default');
  const separatorColor = display.pipe === true ? 'default' : displayColor(display.color, 'separator', outputColor);
  const separator = display.separator ?? ': ';
  const globalKeyWidth = display.key?.width ?? display.keyWidth ?? 0;
  const lines: PreviewLine[] = [];

  for (const moduleConfig of modules) {
    const type = normalizeType(moduleConfig.type);
    if (!evaluateConditions(moduleConfig, profile)) continue;
    const values = getModuleValues(type, profile, display);
    if (type === 'break' || type === 'logo') {
      lines.push({ id: moduleConfig.id, kind: 'break', moduleType: type, segments: [] });
      continue;
    }
    if (type === 'colors') {
      const block = (moduleConfig.block || {}) as Record<string, unknown>;
      const range = Array.isArray(block.range) && block.range.length >= 2 ? [Number(block.range[0]), Number(block.range[1])] : [0, 15];
      const width = typeof block.width === 'number' && block.width > 0 ? block.width : 3;
      const backgrounds = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];
      const symbol = moduleConfig.symbol === 'square' ? '■' : moduleConfig.symbol === 'dot' ? '•' : ' ';
      const colorBlocks = Array.from({ length: Math.max(0, range[1] - range[0] + 1) }, (_, index) => {
        const colorIndex = range[0] + index;
        const symbolMap: Record<string, string> = { square: '\u25a0', dot: '\u2022', circle: '\u25cf', diamond: '\u25c6', triangle: '\u25b2', star: '\u2605', background: ' ' };
        const actualSymbol = symbolMap[String(moduleConfig.symbol || 'background')] || symbol || ' ';
        return { index: colorIndex, background: display.pipe === true ? 'transparent' : backgrounds[colorIndex] || '#000000', text: actualSymbol.repeat(width) };
      });
      lines.push({ id: moduleConfig.id, kind: 'colors', moduleType: type, segments: [], colorBlocks });
      continue;
    }
    if (type === 'title') {
      const titleValues = { 'user-name': 'user', 'host-name': 'hostname', 'user-name-colored': 'user', 'at-symbol-colored': '@', 'host-name-colored': 'hostname' };
      const rendered = renderFormat(moduleConfig.format || '{user-name}@{host-name}', type, { ...titleValues, ...values }, display, general, diagnostics, moduleConfig.id, titleColor);
      lines.push({ id: moduleConfig.id, kind: 'title', moduleType: type, output: rendered.text || 'user@hostname', segments: rendered.segments, outputColor: titleColor });
      continue;
    }
    if (type === 'separator') {
      const separatorString = typeof moduleConfig.string === 'string' && moduleConfig.string.length > 0 ? moduleConfig.string : '-';
      const titleValues = getModuleValues('title', profile, display);
      const titleLength = 1 + (titleValues['user-name'] || 'user').length + (titleValues['host-name'] || 'hostname').split('.')[0].length;
      const separatorTimes = typeof moduleConfig.times === 'number' && moduleConfig.times > 0 ? moduleConfig.times : titleLength;
      const separatorText = separatorString.repeat(separatorTimes).slice(0, typeof moduleConfig.times === 'number' && moduleConfig.times > 0 ? undefined : titleLength);
      const rendered = moduleConfig.format
        ? renderFormat(moduleConfig.format, type, values, display, general, diagnostics, moduleConfig.id, separatorColor)
        : { text: separatorText, segments: [{ text: separatorText, color: moduleColor(moduleConfig.outputColor, separatorColor) }] };
      lines.push({ id: moduleConfig.id, kind: 'separator', moduleType: type, output: rendered.text, segments: rendered.segments, outputColor: separatorColor });
      continue;
    }
    if (type === 'custom' || type === 'text') {
      const customOutputColor = moduleColor(moduleConfig.outputColor, outputColor);
      const rendered = renderFormat(moduleConfig.format || moduleConfig.key || 'Custom Text', type, values, display, general, diagnostics, moduleConfig.id, customOutputColor);
      lines.push({ id: moduleConfig.id, kind: 'custom', moduleType: type, output: rendered.text, segments: rendered.segments, outputColor: customOutputColor });
      continue;
    }
    if (type === 'command' || type === 'file') {
      diagnostics.push({ level: 'warning', message: `${type === 'command' ? 'Command' : 'File'} output is represented by capture/sample data in the browser`, moduleId: moduleConfig.id });
    }
    const key = moduleConfig.key ?? LABELS[type] ?? moduleConfig.type;
    const hasExplicitFormat = typeof moduleConfig.format === 'string' && moduleConfig.format.length > 0;
    const format = moduleConfig.format || DEFAULT_FORMATS[type] || '{result}';
    if (!DEFAULT_FORMATS[type] && !moduleConfig.format && !['command', 'file'].includes(type)) {
      const message = `Module type "${moduleConfig.type}" is outside the verified browser preview surface`;
      diagnostics.push({ level: 'error', message, moduleId: moduleConfig.id });
      unsupportedFeatures.push(message);
    }
    const keyType = display.key?.type;
    const moduleKeyWidth = typeof moduleConfig.keyWidth === 'number' ? moduleConfig.keyWidth : globalKeyWidth;
    const icon = String(moduleConfig.keyIcon || KEY_ICONS[type] || '◆');
    const iconGap = keyType === 'both-0' ? '' : keyType === 'both-2' ? '  ' : keyType === 'both-3' ? '   ' : keyType === 'both-4' ? '    ' : ' ';
    const capturedValueSets = getModuleValueSets(type, profile, display);
    const valueSets = !hasExplicitFormat && type === 'codec' ? capturedValueSets.slice(0, 2) : capturedValueSets;
  if (type === 'loadavg' && !moduleConfig.compact && valueSets.length > 0) {
      const load = valueSets[0];
      ['1', '5', '15'].forEach((minutes, index) => {
        const keyValue = `${LABELS.loadavg} (${minutes} min)`;
        const text = load[`loadavg${index + 1}`] || '';
        const lineKeyColor = moduleColor(moduleConfig.keyColor, keyColor);
        const lineOutputColor = moduleColor(moduleConfig.outputColor, outputColor);
        const linePaddedKey = moduleKeyWidth > 0 ? keyValue.padEnd(moduleKeyWidth, ' ') : keyValue;
        lines.push({ id: `${moduleConfig.id}-${index}`, kind: 'module', moduleType: type, key: linePaddedKey, separator, output: text, segments: [{ text: linePaddedKey, color: lineKeyColor, bold: true }, { text: separator, color: separatorColor }, { text, color: lineOutputColor }], keyColor: lineKeyColor, outputColor: lineOutputColor, separatorColor, keyWidth: moduleKeyWidth });
      });
      continue;
    }
    if (type === 'display' && String(moduleConfig.compactType || 'none').toLowerCase() !== 'none' && valueSets.length > 0) {
      const compactType = String(moduleConfig.compactType).toLowerCase();
      const compactOutput = valueSets.map((valueSet) => {
        const original = compactType.startsWith('original');
        const width = original ? valueSet.width : valueSet['scaled-width'] || valueSet.width;
        const height = original ? valueSet.height : valueSet['scaled-height'] || valueSet.height;
        let output = `${width}x${height}`;
        if (compactType.includes('refresh-rate') && valueSet['refresh-rate']) output += ` @ ${moduleConfig.preciseRefreshRate ? Number(valueSet['refresh-rate']).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') : Math.round(Number(valueSet['refresh-rate']))}Hz`;
        return output;
      }).join(', ');
      const lineKey = moduleConfig.key ?? key;
      const lineHiddenKey = lineKey === ' ' || keyType === 'none';
      const lineVisibleKey = keyType === 'icon' ? icon : keyType?.startsWith('both') || keyType === 'both' ? `${icon}${iconGap}${lineKey}` : lineKey;
      const linePaddedKey = lineHiddenKey ? '' : `${' '.repeat(display.key?.paddingLeft || 0)}${moduleKeyWidth > 0 ? lineVisibleKey.padEnd(moduleKeyWidth, ' ') : lineVisibleKey}`;
      const lineKeyColor = moduleColor(moduleConfig.keyColor, keyColor);
      const lineOutputColor = moduleColor(moduleConfig.outputColor, outputColor);
      lines.push({ id: `${moduleConfig.id}-0`, kind: 'module', moduleType: type, key: linePaddedKey, separator, output: compactOutput, segments: [...(lineHiddenKey ? [] : [{ text: linePaddedKey, color: lineKeyColor, bold: true }]), ...(lineHiddenKey ? [] : [{ text: separator, color: separatorColor }]), { text: compactOutput, color: lineOutputColor }], keyColor: lineKeyColor, outputColor: lineOutputColor, separatorColor, keyWidth: moduleKeyWidth });
      continue;
    }
    valueSets.forEach((valueSet, resultIndex, valueSets) => {
      const lineKey = moduleConfig.key ?? (
        type === 'gpu' && valueSets.length > 1 ? `${LABELS[type] || moduleConfig.type} ${resultIndex + 1}` :
        type === 'disk' && valueSet.mountpoint ? `${LABELS[type] || moduleConfig.type} (${valueSet.mountpoint})` :
        (type === 'display' || type === 'monitor') && valueSet.name ? `${LABELS[type] || moduleConfig.type} (${valueSet.name})` :
        type === 'localip' && (valueSet.ifname || valueSet.name) ? `${LABELS[type] || moduleConfig.type} (${valueSet.ifname || valueSet.name})` :
        ['netio', 'diskio', 'physicaldisk'].includes(type) && valueSet.name ? `${LABELS[type] || moduleConfig.type} (${valueSet.name})` :
        type === 'bluetoothradio' && valueSet.name ? `${LABELS[type] || moduleConfig.type} (${valueSet.name})` :
        type === 'bios' && valueSet.type ? `${LABELS[type] || moduleConfig.type} (${valueSet.type.toLowerCase() === 'bios' ? 'Legacy' : valueSet.type})` :
        type === 'codec' && valueSet.direction ? `${LABELS[type] || moduleConfig.type} (${valueSet.direction})` :
        type === 'cpucache' && valueSet.level ? `${LABELS[type] || moduleConfig.type} (${valueSet.level})` :
        type === 'brightness' && valueSet.name ? `${LABELS[type] || moduleConfig.type} (${valueSet.name})` :
        ['battery', 'bluetooth', 'bluetoothradio', 'gamepad', 'keyboard', 'mouse', 'netio', 'diskio', 'physicaldisk', 'physicalmemory', 'poweradapter', 'sound', 'users', 'wifi'].includes(type) && valueSets.length > 1 ? `${LABELS[type] || moduleConfig.type} ${resultIndex + 1}` :
        key
      );
      const lineHiddenKey = lineKey === ' ' || keyType === 'none';
      const lineVisibleKey = keyType === 'icon' ? icon : keyType?.startsWith('both') || keyType === 'both' ? `${icon}${iconGap}${lineKey}` : lineKey;
      const linePaddedKey = lineHiddenKey ? '' : `${' '.repeat(display.key?.paddingLeft || 0)}${moduleKeyWidth > 0 ? lineVisibleKey.padEnd(moduleKeyWidth, ' ') : lineVisibleKey}`;
      const lineKeyColor = moduleColor(moduleConfig.keyColor, keyColor);
      const lineOutputColor = moduleColor(moduleConfig.outputColor, outputColor);
      const lineKeySegments = lineHiddenKey ? [] : [{ text: linePaddedKey, color: lineKeyColor, bold: true }];
      const lineSeparatorSegments = lineHiddenKey ? [] : [{ text: separator, color: separatorColor }];
      const nativeDefault = !hasExplicitFormat ? nativeDefaultOutput(type, valueSet, moduleConfig, display, resultIndex, valueSets.length) : undefined;
      if (nativeDefault === null) return;
      const rendered = nativeDefault !== undefined
        ? { text: trimRendered(nativeDefault), segments: [{ text: trimRendered(nativeDefault), color: lineOutputColor }] }
        : renderFormat(format, type, valueSet, display, general, diagnostics, moduleConfig.id, lineOutputColor);
      lines.push({
        id: `${moduleConfig.id}-${resultIndex}`, kind: 'module', moduleType: type, key: linePaddedKey, separator, output: rendered.text,
        segments: [...lineKeySegments, ...lineSeparatorSegments, ...rendered.segments], keyColor: lineKeyColor,
        outputColor: lineOutputColor, separatorColor, keyWidth: moduleKeyWidth,
      });
    });
  }
  return { profile, lines, diagnostics, terminalStream: linesToTerminalStream(lines), unsupportedFeatures: [...new Set(unsupportedFeatures)] };
}

export const previewLabels = LABELS;
