import { PreviewPlatform, PreviewProfile } from '@/data/previewProfiles';

export interface FastfetchCapture {
  format: 'fastfetch-configurator-capture-v1';
  fastfetchVersion?: string;
  platform: PreviewPlatform;
  architecture?: string;
  capturedAt?: string;
  values: Record<string, Record<string, string> | Record<string, string>[]>;
  succeeded?: Record<string, boolean | boolean[]>;
}

const platformFromString = (value: unknown): PreviewPlatform => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('windows')) return 'windows';
  if (normalized.includes('darwin') || normalized.includes('mac')) return 'macos';
  return 'linux';
};

const normalizeKey = (key: string) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

const isScalar = (value: unknown): value is string | number | boolean =>
  ['string', 'number', 'boolean'].includes(typeof value);

const formatBytes = (value: number): string => {
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
  return `${amount.toFixed(2)} ${unit}`;
};

const formatFrequency = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  return `${(value / 1000).toFixed(2)} GHz`;
};

const formatPercentNumber = (value: number): string => Number.isFinite(value) ? String(Math.round(value)) : '';

const hasResultData = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return false;
};

const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 60) return `${totalSeconds} second${totalSeconds === 1 ? '' : 's'}`;
  let roundedSeconds = totalSeconds;
  const seconds = roundedSeconds % 60;
  roundedSeconds = Math.floor(roundedSeconds / 60) + (seconds >= 30 ? 1 : 0);
  const minutes = roundedSeconds % 60;
  roundedSeconds = Math.floor(roundedSeconds / 60);
  const hours = roundedSeconds % 24;
  const days = Math.floor(roundedSeconds / 24);
  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
  return parts.join(', ');
};

const formatShortTime = (value: string): string => {
  const nativeLocal = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/.exec(value);
  if (nativeLocal) return `${nativeLocal[1]} ${nativeLocal[2]}`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
};

const flattenScalars = (value: unknown, prefix = '', output: Record<string, string> = {}): Record<string, string> => {
  if (value === null || value === undefined) {
    if (prefix) output[prefix] = '';
    return output;
  }
  if (isScalar(value)) {
    output[prefix || 'result'] = String(value);
    return output;
  }
  if (Array.isArray(value)) {
    if (value.every(isScalar)) {
      output[prefix || 'result'] = value.map(String).join(', ');
      return output;
    }
    value.forEach((item, index) => flattenScalars(item, prefix ? `${prefix}-${index + 1}` : String(index + 1), output));
    return output;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      const normalized = normalizeKey(key);
      flattenScalars(item, prefix ? `${prefix}-${normalized}` : normalized, output);
    });
  }
  return output;
};

const copyAlias = (values: Record<string, string>, target: string, ...sources: string[]) => {
  if (values[target] !== undefined && values[target] !== '') return;
  const source = sources.find((key) => values[key] !== undefined && values[key] !== '');
  if (source) values[target] = values[source];
};

/**
 * Fastfetch JSON is intentionally a raw, nested object. Format placeholders,
 * however, use flattened names such as `{cores-logical}` and `{size-used}`.
 * Normalize both shapes here so an imported native capture drives the same
 * renderer as a deterministic profile.
 */
const scalarValues = (value: unknown, moduleType = ''): Record<string, string> => {
  const values = flattenScalars(value);
  const type = normalizeKey(moduleType);

  // Common nested fields emitted by the native JSON formatter.
  copyAlias(values, 'name', 'cpu', 'pretty-name');
  copyAlias(values, 'pretty-name', 'name');
  copyAlias(values, 'cores-physical', 'cores-physical', 'cores-physical-count', 'cores-physical-number');
  copyAlias(values, 'cores-logical', 'cores-logical', 'cores-logical-count', 'cores-logical-number');
  copyAlias(values, 'cores-online', 'cores-online', 'cores-online-count', 'cores-online-number');
  copyAlias(values, 'arch', 'arch', 'architecture');
  if (type === 'kernel') copyAlias(values, 'sysname', 'name');
  copyAlias(values, 'freq-base', 'frequency-base');
  copyAlias(values, 'freq-max', 'frequency-max');
  copyAlias(values, 'core-count', 'core-count', 'corecount');

  if (type === 'display' || type === 'monitor') {
    for (const field of ['width', 'height', 'refresh-rate', 'scaled-width', 'scaled-height', 'name', 'type', 'rotation', 'physical-width', 'physical-height', 'serial', 'platform-api']) {
      copyAlias(values, field, `output-${field}`, `scaled-${field}`, `physical-${field}`);
    }
    copyAlias(values, 'is-primary', 'primary');
    copyAlias(values, 'bit-depth', 'bit-depth');
    copyAlias(values, 'hdr-enabled', 'hdr-enabled');
    copyAlias(values, 'preferred-width', 'preferred-width');
    copyAlias(values, 'preferred-height', 'preferred-height');
    copyAlias(values, 'preferred-refresh-rate', 'preferred-refresh-rate');
    copyAlias(values, 'dpi', 'dpi', 'output-dpi');
    copyAlias(values, 'hdr-status', 'hdr-status');
    if (values['hdr-status'] && !values['hdr-enabled']) {
      const status = values['hdr-status'].toLowerCase();
      values['hdr-enabled'] = String(status === 'enabled' || status === 'true' || status === '1');
      values['hdr-compatible'] = String(values['hdr-enabled'] === 'true' || status === 'supported');
    }
    if (values['output-width'] && values['scaled-width'] && Number(values['output-width']) > 0) {
      values['scale-factor'] = (Number(values['output-width']) / Number(values['scaled-width'])).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    }
    if (values['physical-width'] && values['physical-height']) {
      const diagonalInches = Math.sqrt(Number(values['physical-width']) ** 2 + Number(values['physical-height']) ** 2) / 25.4;
      if (Number.isFinite(diagonalInches)) values.inch = diagonalInches.toFixed(type === 'monitor' ? 2 : 1);
    }
  }

  if (type === 'cpu') {
    if (values['frequency-base']) values['freq-base-mhz'] = values['frequency-base'];
    if (values['frequency-max']) values['freq-max-mhz'] = values['frequency-max'];
    if (values['frequency-base'] && /^\d+(?:\.\d+)?$/.test(values['frequency-base'])) values['freq-base'] = formatFrequency(Number(values['frequency-base']));
    if (values['frequency-max'] && /^\d+(?:\.\d+)?$/.test(values['frequency-max'])) values['freq-max'] = formatFrequency(Number(values['frequency-max']));
    const coreTypeCounts = Object.entries(values)
      .filter(([key, value]) => /^core-types-\d+-count$/.test(key) && value !== '')
      .sort(([a], [b]) => Number(a.split('-')[2]) - Number(b.split('-')[2]))
      .map(([, value]) => value);
    if (coreTypeCounts.length > 0) values['core-types'] = coreTypeCounts.join('+');
  }

  if (type === 'memory' || type === 'swap' || type === 'disk' || type === 'btrfs' || type === 'zpool' || type === 'physicalmemory') {
    copyAlias(values, 'size-used', 'bytes-used');
    copyAlias(values, 'size-total', 'bytes-total');
    copyAlias(values, 'used', 'bytes-used');
    copyAlias(values, 'total', 'bytes-total');
    const rawUsed = values['bytes-used'] || values.used;
    const rawTotal = values['bytes-total'] || values.total;
    if (rawUsed && /^\d+(?:\.\d+)?$/.test(rawUsed)) values['used-bytes'] = rawUsed;
    if (rawTotal && /^\d+(?:\.\d+)?$/.test(rawTotal)) values['total-bytes'] = rawTotal;
    for (const field of ['used', 'total', 'free', 'available']) {
      const raw = values[`bytes-${field}`];
      if (raw && /^\d+(?:\.\d+)?$/.test(raw)) values[field] = formatBytes(Number(raw));
      const direct = values[field];
      if (direct && /^\d+(?:\.\d+)?$/.test(direct) && (type === 'memory' || type === 'swap')) values[field] = formatBytes(Number(direct));
    }
    if ((type === 'memory' || type === 'swap') && rawUsed && rawTotal && Number(rawTotal) > 0 && /^\d+(?:\.\d+)?$/.test(rawUsed) && /^\d+(?:\.\d+)?$/.test(rawTotal)) {
      values.percentage = String(Math.round((Number(rawUsed) / Number(rawTotal)) * 100));
    }
    if (type === 'physicalmemory' && values.bytes && /^\d+(?:\.\d+)?$/.test(values.bytes)) values.size = formatBytes(Number(values.bytes));
  }

  if (type === 'disk') {
    copyAlias(values, 'mountpoint', 'mount-point');
    copyAlias(values, 'mount-from', 'mount-from');
    const used = values['bytes-used'];
    const total = values['bytes-total'];
    if (used && total && Number(total) > 0) values['size-percentage'] = String(Math.round((Number(used) / Number(total)) * 100));
    if (values.used) values['size-used'] = values.used;
    if (values.total) values['size-total'] = values.total;
  }

  if (type === 'uptime' && values.uptime && /^\d+(?:\.\d+)?$/.test(values.uptime)) {
    const seconds = Math.floor(Number(values.uptime) / 1000);
    values.days = String(Math.floor(seconds / 86400));
    values.hours = String(Math.floor((seconds % 86400) / 3600));
    values.minutes = String(Math.floor((seconds % 3600) / 60));
    values.seconds = String(seconds % 60);
    values.formatted = formatDuration(seconds);
  }

  if (type === 'font') copyAlias(values, 'combined', 'display');
  if (type === 'terminalfont') copyAlias(values, 'combined', 'font-pretty', 'pretty', 'display');
  if (type === 'camera') copyAlias(values, 'colorspace', 'colorspace', 'color-space');
  if (type === 'title') {
    copyAlias(values, 'user-name', 'user-name', 'user-name');
    copyAlias(values, 'host-name', 'host-name', 'host-name');
    copyAlias(values, 'full-user-name', 'full-user-name');
  }
  if (type === 'localip') copyAlias(values, 'ifname', 'name');
  if (type === 'localip') copyAlias(values, 'is-default-route', 'default-route-ipv4', 'default-route-ipv6', 'default-route');
  if (type === 'localip' && values.speed && /^\d+(?:\.\d+)?$/.test(values.speed)) {
    const speed = Number(values.speed);
    values.speed = speed >= 1000 ? `${(speed / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} Gbps` : `${speed} Mbps`;
  }
  if (type === 'datetime') {
    const raw = values.result || (typeof value === 'string' ? value : '');
    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(raw);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      Object.assign(values, {
        result: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
        year, 'year-short': year.slice(-2), month, 'month-pretty': month, 'day-in-month': day, 'day-pretty': day,
        hour, 'hour-pretty': hour, minute, 'minute-pretty': minute, second, 'second-pretty': second,
      });
    }
  }
  if (type === 'dns' && Array.isArray(value)) {
    const addresses = value.map(String);
    values.result = [...addresses.filter((address) => address.includes('.')), ...addresses.filter((address) => !address.includes('.'))].join(' ');
  }
  if (type === 'cpuusage' && Array.isArray(value)) {
    const samples = value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item));
    if (samples.length > 0) {
      values.avg = formatPercentNumber(samples.reduce((sum, item) => sum + item, 0) / samples.length);
      values.max = formatPercentNumber(Math.max(...samples));
      values.min = formatPercentNumber(Math.min(...samples));
      values['max-index'] = String(samples.indexOf(Math.max(...samples)));
      values['min-index'] = String(samples.indexOf(Math.min(...samples)));
    }
  }
  if (type === 'netio') {
    for (const [source, target] of [['rx-bytes', 'rx-size'], ['tx-bytes', 'tx-size']] as const) {
      if (values[source] && /^\d+(?:\.\d+)?$/.test(values[source])) values[target] = formatBytes(Number(values[source]));
    }
  }
  if (type === 'diskio') {
    for (const [source, target] of [['bytes-read', 'size-read'], ['bytes-written', 'size-written']] as const) {
      if (values[source] && /^\d+(?:\.\d+)?$/.test(values[source])) values[target] = formatBytes(Number(values[source]));
    }
  }
  if (type === 'sound') copyAlias(values, 'volume-percentage', 'volume', 'volume-percentage');
  if (type === 'brightness') {
    const current = Number(values.current);
    const max = Number(values.max);
    const min = Number(values.min);
    if (!values.percentage && Number.isFinite(current) && Number.isFinite(max) && max > min) values.percentage = formatPercentNumber(((current - min) / (max - min)) * 100);
    copyAlias(values, 'is-builtin', 'builtin', 'is-builtin');
  }
  if (type === 'gpu') {
    copyAlias(values, 'dedicated-total', 'memory-dedicated-total');
    copyAlias(values, 'dedicated-used', 'memory-dedicated-used');
    copyAlias(values, 'shared-total', 'memory-shared-total');
    copyAlias(values, 'shared-used', 'memory-shared-used');
    copyAlias(values, 'platform-api', 'platform-api');
    if (values.frequency && /^\d+(?:\.\d+)?$/.test(values.frequency)) {
      values['frequency-mhz'] = values.frequency;
      values.frequency = formatFrequency(Number(values.frequency));
    }
    for (const field of ['dedicated-total', 'dedicated-used', 'shared-total', 'shared-used']) {
      const raw = values[`memory-${field}`];
      if (raw && /^\d+(?:\.\d+)?$/.test(raw)) values[field] = formatBytes(Number(raw));
    }
    copyAlias(values, 'type', 'gpu-type');
  }

  if (type === 'physicalmemory') {
    if (values.size && /^\d+(?:\.\d+)?$/.test(values.size)) {
      values.bytes = values.size;
      values.size = formatBytes(Number(values.size));
    }
  }

  if (type === 'physicaldisk') {
    if (values.size && /^\d+(?:\.\d+)?$/.test(values.size)) values.size = formatBytes(Number(values.size));
    copyAlias(values, 'physical-type', 'kind');
    if (values.removable) values['removable-type'] = values.removable === 'true' ? 'Removable' : 'Fixed';
    if (values['read-only']) values['readonly-type'] = values['read-only'] === 'true' ? 'Read-only' : 'Read-write';
  }

  if (values['login-time']) values['login-time'] = formatShortTime(values['login-time']);

  return values;
};

const firstCaptureValue = (value: Record<string, string> | Record<string, string>[] | undefined) =>
  Array.isArray(value) ? value[0] || {} : value || {};

const captureValues = (value: unknown, moduleType = ''): Record<string, string> | Record<string, string>[] => {
  const type = normalizeKey(moduleType);
  if (type === 'cpucache' && value && typeof value === 'object' && !Array.isArray(value)) {
    const cache = value as Record<string, unknown>;
    const result: Record<string, string>[] = [];
    for (const [key, label] of [['l1', 'L1'], ['l2', 'L2'], ['l3', 'L3']] as const) {
      const entries = Array.isArray(cache[key]) ? cache[key] : cache[key] ? [cache[key]] : [];
      const pieces = entries.map((entry) => {
        const item = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
        const size = typeof item.size === 'number' ? formatBytes(item.size) : String(item.size || '');
        const count = item.num === undefined || Number(item.num) <= 1 ? '' : `${item.num}x`;
        const cacheType = String(item.type || '').toLowerCase();
        const suffix = cacheType === 'data' ? ' (D)' : cacheType === 'instruction' ? ' (I)' : cacheType === 'unified' ? ' (U)' : '';
        return `${count}${size}${suffix}`;
      }).filter(Boolean);
      if (pieces.length > 0) result.push({ level: label, result: pieces.join(', ') });
    }
    return result.length > 0 ? result : scalarValues(value, type);
  }
  if (type === 'codec') {
    const entries = Array.isArray(value) ? value : [value];
    const expanded: Record<string, string>[] = [];
    entries.forEach((entry) => {
      const base = scalarValues(entry, type);
      const encoders = base.encoders || base.encoder || '';
      const decoders = base.decoders || base.decoder || '';
      if (encoders) expanded.push({ ...base, types: encoders, direction: 'Encoder' });
      if (decoders) expanded.push({ ...base, types: decoders, direction: 'Decoder' });
      if (!encoders && !decoders) expanded.push(base);
    });
    return expanded;
  }
  if (type === 'dns' || type === 'cpuusage') return scalarValues(value, type);
  return Array.isArray(value) ? value.map((item) => scalarValues(item, type)) : scalarValues(value, type);
};

/**
 * Accepts the configurator capture format and the common array/object shapes
 * emitted by `fastfetch --format json` so users can paste native output.
 */
export function parseFastfetchCapture(input: string | unknown): PreviewProfile {
  const parsed: unknown = typeof input === 'string' ? JSON.parse(input.replace(/^\uFEFF/, '')) : input;
  let platform: PreviewPlatform = 'linux';
  let architecture = 'x86_64';
  let version: string | undefined;
  let values: Record<string, Record<string, string> | Record<string, string>[]> = {};
  const succeeded: Record<string, boolean | boolean[]> = {};

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const object = parsed as Record<string, unknown>;
    platform = platformFromString(object.platform || object.os || object.system);
    architecture = String(object.architecture || object.arch || architecture);
    version = object.fastfetchVersion ? String(object.fastfetchVersion) : undefined;
    if (object.succeeded && typeof object.succeeded === 'object') {
      Object.entries(object.succeeded as Record<string, unknown>).forEach(([type, result]) => {
        if (typeof result === 'boolean' || Array.isArray(result)) succeeded[normalizeKey(type)] = result as boolean | boolean[];
      });
    }
    if (object.values && typeof object.values === 'object') {
    values = Object.fromEntries(Object.entries(object.values as Record<string, unknown>).map(([type, result]) => [normalizeKey(type), captureValues(result, type)]));
    } else {
      const metadata = new Set(['platform', 'system', 'architecture', 'arch', 'fastfetchversion', 'capturedat', 'format', 'succeeded']);
      values = Object.fromEntries(Object.entries(object)
        .filter(([type, result]) => !metadata.has(type.toLowerCase()) && result && typeof result === 'object')
        .map(([type, result]) => [normalizeKey(type), captureValues(result, type)]));
    }
  } else if (Array.isArray(parsed)) {
    values = parsed.reduce<Record<string, Record<string, string> | Record<string, string>[]>>((result, item) => {
      const record = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const type = String(record.type || record.module || 'custom').toLowerCase();
      const hasResultField = Object.prototype.hasOwnProperty.call(record, 'result') || Object.prototype.hasOwnProperty.call(record, 'data');
      const rawResult = record.result ?? record.data ?? (hasResultField ? undefined : Object.fromEntries(Object.entries(record).filter(([key]) => !['type', 'module', 'error'].includes(key))));
      const nextValue = captureValues(rawResult, type);
      const nextSucceeded = !record.error && hasResultData(rawResult);
      const previousSucceeded = succeeded[type];
      succeeded[type] = previousSucceeded === undefined
        ? nextSucceeded
        : [...(Array.isArray(previousSucceeded) ? previousSucceeded : [previousSucceeded]), nextSucceeded];
      const existing = result[type];
      if (!existing) result[type] = nextValue;
      else result[type] = [
        ...(Array.isArray(existing) ? existing : [existing]),
        ...(Array.isArray(nextValue) ? nextValue : [nextValue]),
      ];
      return result;
    }, {});
  } else {
    throw new Error('Capture must be a JSON object or Fastfetch JSON result array');
  }

  if (Object.keys(values).length === 0) throw new Error('Capture contains no module values');
  const os = firstCaptureValue(values.os);
  const kernel = firstCaptureValue(values.kernel);
  const detectedSystem = os.sysname || os.name || kernel.sysname;
  if (detectedSystem) platform = platformFromString(detectedSystem);
  architecture = os.arch || kernel.arch || architecture;
  return { id: platform, label: `${platform} capture${version ? ` (Fastfetch ${version})` : ''}`, architecture, values, source: 'capture', ...(Object.keys(succeeded).length > 0 ? { succeeded } : {}) };
}

export function serializeFastfetchCapture(profile: PreviewProfile, fastfetchVersion?: string): string {
  const capture: FastfetchCapture = {
    format: 'fastfetch-configurator-capture-v1',
    fastfetchVersion,
    platform: profile.id,
    architecture: profile.architecture,
    capturedAt: new Date().toISOString(),
    values: profile.values,
    succeeded: profile.succeeded,
  };
  return JSON.stringify(capture, null, 2);
}

export function getCaptureCommand(platform: PreviewPlatform): string {
  if (platform === 'windows') {
    return 'fastfetch --config "$env:USERPROFILE/.config/fastfetch/config.jsonc" --format json | Out-File -Encoding utf8 fastfetch-capture.json';
  }
  return 'fastfetch --config ~/.config/fastfetch/config.jsonc --format json > fastfetch-capture.json';
}
