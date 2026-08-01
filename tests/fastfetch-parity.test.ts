import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildPreviewModel } from '@/utils/fastfetchPreview';
import { parseFastfetchCapture } from '@/utils/fastfetchCapture';
import { buildConfigDocument } from '@/utils/configExport';
import { findModuleSchema } from '@/utils/fastfetchSchema';
import { ModuleConfig } from '@/store/config';

const commandModule: ModuleConfig = {
  id: 'command-1',
  type: 'command',
  text: 'echo deterministic',
  key: 'Command',
  format: '{result}',
};

const commandDisplay = {
  separator: ' :: ',
  color: { keys: 'red', output: 'green', separator: 'blue' },
  key: { type: 'string' as const },
};

const visibleLine = (modules: ModuleConfig[], values: Record<string, Record<string, string>>) => {
  const model = buildPreviewModel(modules, { type: 'none' }, commandDisplay, {
    id: 'windows',
    label: 'Windows fixture',
    architecture: 'x86_64',
    values,
  });
  return model.lines.flatMap((line) => line.segments.map((segment) => segment.text)).join('');
};

describe('preview engine', () => {
  test('renders a captured command with the configured key and separator', () => {
    expect(visibleLine([commandModule], { command: { result: 'deterministic' } })).toBe('Command :: deterministic');
  });

  test('supports named, numeric, conditional, and inline color formats', () => {
    const cpu: ModuleConfig = { id: 'cpu-1', type: 'cpu', format: '{1} {2} {?cores-logical}({cores-logical}){?}{#red}!{#}' };
    const model = buildPreviewModel([cpu], { type: 'none' }, { separator: ': ', color: { keys: 'blue', output: 'default' } }, {
      id: 'linux', label: 'Linux fixture', architecture: 'x86_64', values: {
        cpu: { name: 'Test CPU', vendor: 'Test Vendor', 'cores-logical': '8' },
      },
    });
    expect(model.lines[0]?.segments.map((segment) => segment.text).join('')).toContain('Test CPU Test Vendor (8)!');
    expect(model.lines[0]?.segments.some((segment) => segment.color === 'red')).toBe(true);
  });

  test('resolves nested optional format blocks', () => {
    const model = buildPreviewModel([{ id: 'cpu-1', type: 'cpu', format: '{name}{?cores-logical} ({?cores-physical}{cores-physical}/{?}logical={cores-logical}){?}' }], { type: 'none' }, { separator: ': ' }, {
      id: 'linux', label: 'Linux fixture', architecture: 'x86_64', values: { cpu: { name: 'CPU', 'cores-logical': '8', 'cores-physical': '4' } },
    });
    expect(model.lines[0]?.output).toBe('CPU (4/logical=8)');
  });

  test('honors succeeded conditions from native capture results', () => {
    const profile = parseFastfetchCapture([{ type: 'Battery', result: null, error: 'not available' }]);
    const model = buildPreviewModel([{ id: 'battery-1', type: 'battery', condition: { succeeded: true } }], { type: 'none' }, { separator: ': ' }, profile);
    expect(model.lines).toHaveLength(0);
    expect(profile.succeeded?.battery).toBe(false);
  });

  test('preserves multiple native results for one module type', () => {
    const profile = parseFastfetchCapture([
      { type: 'GPU', result: { name: 'GPU A' } },
      { type: 'GPU', result: { name: 'GPU B' } },
    ]);
    const model = buildPreviewModel([{ id: 'gpu-1', type: 'gpu', format: '{name}' }], { type: 'none' }, { separator: ': ' }, profile);
    expect(model.lines).toHaveLength(2);
    expect(model.lines.map((line) => line.output)).toEqual(['GPU A', 'GPU B']);
  });

  test('normalizes nested native JSON fields into Fastfetch placeholders', () => {
    const profile = parseFastfetchCapture([
      { type: 'OS', result: { sysname: 'Windows', arch: 'x86_64', prettyName: 'Windows 11 Pro' } },
      { type: 'CPU', result: { cpu: 'Test CPU', cores: { logical: 16 }, frequency: { max: 5550 } } },
      { type: 'Memory', result: { used: 13962768384, total: 33459838976 } },
      { type: 'Display', result: [{ name: 'Panel', output: { width: 2560, height: 1440, refreshRate: 200 }, scaled: { width: 2048, height: 1152 }, physical: { width: 597, height: 336 }, type: 'External' }] },
    ]);
    expect(profile.id).toBe('windows');
    expect(profile.architecture).toBe('x86_64');
    expect(profile.values.cpu).toMatchObject({ name: 'Test CPU', 'cores-logical': '16', 'freq-max': '5.55 GHz' });
    expect(profile.values.memory).toMatchObject({ used: '13.00 GiB', total: '31.16 GiB' });
    expect(profile.values.display).toMatchObject([{ name: 'Panel', 'output-width': '2560', 'output-height': '1440', 'output-refresh-rate': '200', width: '2560', height: '1440', 'refresh-rate': '200', 'scale-factor': '1.25', inch: '27.0' }]);
  });

  test('normalizes compound results and omits unavailable native rows', () => {
    const profile = parseFastfetchCapture([
      { type: 'Packages', result: { all: 0 } },
      { type: 'DateTime', result: '2026-08-01T10:20:30.123+0800' },
      { type: 'DNS', result: ['fd00::1', '192.0.2.1'] },
      { type: 'CPUUsage', result: [10, 20, 30] },
      { type: 'CPUCache', result: { l1: [{ size: 49152, num: 8, type: 'data' }], l2: [{ size: 1048576, num: 1, type: 'unified' }] } },
      { type: 'Codec', result: [{ gpu: 'GPU A', encoders: ['H.264'], decoders: ['HEVC'] }, { gpu: 'GPU B', encoders: ['AV1'], decoders: ['VP9'] }] },
      { type: 'Display', result: [{ name: 'Panel', output: { width: 2560, height: 1440, refreshRate: 60 }, physical: { width: 597, height: 336 }, hdrStatus: 'Supported', type: 'External' }] },
      { type: 'Monitor', result: null, error: 'alias' },
    ]);
    expect(profile.values.datetime).toMatchObject({ result: '2026-08-01 10:20:30', year: '2026', 'hour-pretty': '10' });
    expect(profile.values.dns).toMatchObject({ result: '192.0.2.1 fd00::1' });
    expect(profile.values.cpuusage).toMatchObject({ avg: '20', max: '30', min: '10' });
    expect(profile.values.cpucache).toEqual([{ level: 'L1', result: '8x48.00 KiB (D)' }, { level: 'L2', result: '1.00 MiB (U)' }]);
    const model = buildPreviewModel([
      { id: 'packages', type: 'packages' }, { id: 'datetime', type: 'datetime' }, { id: 'dns', type: 'dns' },
      { id: 'usage', type: 'cpuusage' }, { id: 'cache', type: 'cpucache' }, { id: 'codec', type: 'codec' }, { id: 'monitor', type: 'monitor' },
    ], { type: 'none' }, { separator: ' :: ', key: { type: 'string' } }, profile);
    expect(model.lines.map((line) => `${line.key} :: ${line.output}`)).toEqual([
      'Date & Time :: 2026-08-01 10:20:30',
      'DNS :: 192.0.2.1 fd00::1',
      'CPU Usage :: 20%',
      'CPU Cache (L1) :: 8x48.00 KiB (D)',
      'CPU Cache (L2) :: 1.00 MiB (U)',
      'Codec (Encoder) :: H.264',
      'Codec (Decoder) :: HEVC',
      'Monitor (Panel) :: 2560x1440 px @ 60 Hz - 597x336 mm (26.97 inches, 108.90 ppi) [HDR Compatible]',
    ]);
  });

  test('accepts BOM-prefixed object captures with repeated module arrays', () => {
    const profile = parseFastfetchCapture('\uFEFF' + JSON.stringify({
      os: { sysname: 'Darwin', arch: 'arm64', prettyName: 'macOS' },
      display: [{ name: 'Built-in', output: { width: 1728, height: 1117 } }],
    }));
    expect(profile.id).toBe('macos');
    expect(profile.values.display).toHaveLength(1);
  });

  test('round-trips configurator capture metadata and success flags', () => {
    const source = parseFastfetchCapture({ format: 'fastfetch-configurator-capture-v1', platform: 'linux', architecture: 'x86_64', values: { os: { prettyName: 'Arch Linux' } }, succeeded: { os: true } });
    expect(source.source).toBe('capture');
    expect(source.values.os).toMatchObject({ 'pretty-name': 'Arch Linux' });
    expect(source.succeeded?.os).toBe(true);
  });

  test('uses native-style keys for repeated hardware results', () => {
    const profile = parseFastfetchCapture([
      { type: 'GPU', result: { name: 'GPU A', frequency: 2200 } },
      { type: 'GPU', result: { name: 'GPU B', frequency: 2100 } },
      { type: 'Disk', result: { mountpoint: 'C:\\', bytes: { used: 1, total: 2 }, filesystem: 'NTFS' } },
    ]);
    const model = buildPreviewModel([
      { id: 'gpu-1', type: 'gpu', format: '{name} @ {frequency}' },
      { id: 'disk-1', type: 'disk', format: '{filesystem}' },
    ], { type: 'none' }, { separator: ': ' }, profile);
    expect(model.lines.slice(0, 2).map((line) => line.key)).toEqual(['GPU 1', 'GPU 2']);
    expect(model.lines[2]?.key).toBe('Disk (C:\\)');
  });

  test('honors the native colors block range and width', () => {
    const model = buildPreviewModel([
      { id: 'colors-1', type: 'colors', symbol: 'square', block: { width: 2, range: [1, 3] } },
    ], { type: 'none' }, { separator: ': ' }, defaultProfile());
    expect(model.lines[0]?.colorBlocks).toEqual([
      { index: 1, background: '#800000', text: '■■' },
      { index: 2, background: '#008000', text: '■■' },
      { index: 3, background: '#808000', text: '■■' },
    ]);
  });

  test('applies native size and frequency precision options to captured values', () => {
    const model = buildPreviewModel([
      { id: 'memory-1', type: 'memory', format: '{used} / {total}' },
      { id: 'cpu-1', type: 'cpu', format: '{freq-max}' },
    ], { type: 'none' }, { separator: ': ', size: { ndigits: 1 }, freq: { ndigits: 1 } }, {
      id: 'linux', label: 'Linux fixture', architecture: 'x86_64', values: {
        memory: { used: '13.00 GiB', total: '31.16 GiB', 'used-bytes': '13962768384', 'total-bytes': '33459838976' },
        cpu: { name: 'CPU', 'freq-max-mhz': '5550', 'freq-max': '5.55 GHz' },
      },
    });
    expect(model.lines[0]?.output).toBe('13.0 GiB / 31.2 GiB');
    expect(model.lines[1]?.output).toBe('5.5 GHz');
  });

  test('uses Fastfetch default output rules for core modules', () => {
    const profile = {
      id: 'windows' as const,
      label: 'Windows capture',
      architecture: 'x86_64',
      source: 'capture' as const,
      values: {
        os: { 'pretty-name': 'Windows 11 Pro', arch: 'x86_64' },
        kernel: { sysname: 'WIN32_NT', release: '10.0.26200' },
        display: [{ width: '2560', height: '1440', 'scale-factor': '1.25', inch: '27.2', 'refresh-rate': '200', type: 'External' }],
        cpu: { name: 'Test CPU', 'cores-online': '16', 'freq-max': '5.55 GHz' },
        memory: { used: '12.84 GiB', total: '31.16 GiB', percentage: '41' },
        disk: [{ 'size-used': '1.00 GiB', 'size-total': '2.00 GiB', 'size-percentage': '50', filesystem: 'NTFS', mountpoint: 'C:\\' }],
      },
    };
    const model = buildPreviewModel([
      { id: 'os', type: 'os' }, { id: 'kernel', type: 'kernel' }, { id: 'display', type: 'display' },
      { id: 'cpu', type: 'cpu' }, { id: 'memory', type: 'memory' }, { id: 'disk', type: 'disk' },
    ], { type: 'none' }, { separator: ' :: ' }, profile);
    expect(model.lines.map((line) => line.output)).toEqual([
      'Windows 11 Pro x86_64', 'WIN32_NT 10.0.26200', '2560x1440 @ 1.25x in 27", 200 Hz [External]',
      'Test CPU (16) @ 5.55 GHz', '12.84 GiB / 31.16 GiB (41%)', '1.00 GiB / 2.00 GiB (50%) - NTFS',
    ]);
  });

  test('supports native compact display variants', () => {
    const model = buildPreviewModel([{ id: 'display', type: 'display', compactType: 'original-with-refresh-rate' }], { type: 'none' }, { separator: ': ' }, {
      id: 'windows', label: 'Windows capture', source: 'capture', architecture: 'x86_64', values: {
        display: [
          { width: '2560', height: '1440', 'scaled-width': '2048', 'scaled-height': '1152', 'refresh-rate': '200' },
          { width: '1920', height: '1080', 'scaled-width': '1536', 'scaled-height': '864', 'refresh-rate': '60' },
        ],
      },
    });
    expect(model.lines[0]?.output).toBe('2560x1440 @ 200Hz, 1920x1080 @ 60Hz');
  });

  test('removes terminal color effects in pipe mode', () => {
    const model = buildPreviewModel([{ id: 'text', type: 'text', format: '{#red}plain{#}' }, { id: 'colors', type: 'colors', symbol: 'square' }], { type: 'none' }, { separator: ': ', pipe: true }, defaultProfile());
    expect(model.lines[0]?.segments).toEqual([{ text: 'plain', color: 'default' }]);
    expect(model.lines[1]?.colorBlocks?.[0]?.background).toBe('transparent');
  });

  test('renders load average as native three-line or compact output', () => {
    const profile = { ...defaultProfile(), values: { loadavg: { loadavg1: '0.52', loadavg2: '0.48', loadavg3: '0.43' } } };
    const expanded = buildPreviewModel([{ id: 'loadavg', type: 'loadavg' }], { type: 'none' }, { separator: ': ' }, profile);
    expect(expanded.lines.map((line) => line.output)).toEqual(['0.52', '0.48', '0.43']);
    const compact = buildPreviewModel([{ id: 'loadavg', type: 'loadavg', compact: true }], { type: 'none' }, { separator: ': ' }, profile);
    expect(compact.lines[0]?.output).toBe('0.52, 0.48, 0.43');
  });

  test('exports editor metadata-free Fastfetch JSON with the pinned schema', () => {
    const document = buildConfigDocument([commandModule], { type: 'none', _presetName: 'arch' }, commandDisplay);
    expect(document.$schema).toContain('/fastfetch/2.66.0/doc/json_schema.json');
    expect(document.modules).toEqual([{ type: 'command', text: 'echo deterministic', key: 'Command', format: '{result}' }]);
    expect(JSON.stringify(document)).not.toContain('command-1');
  });

  test('finds module options in the schema combining branch', () => {
    const schema = {
      properties: {
        modules: {
          items: {
            anyOf: [
              { enum: ['cpu'] },
              { oneOf: [{ $ref: '#/$defs/CPU' }] },
            ],
          },
        },
      },
      $defs: {
        CPU: { type: 'object', properties: { type: { const: 'cpu' }, temp: { type: 'boolean' } } },
      },
    };
    expect(findModuleSchema(schema, 'cpu')?.properties?.temp?.type).toBe('boolean');
  });
});

function defaultProfile() {
  return {
    id: 'linux' as const,
    label: 'Linux fixture',
    architecture: 'x86_64',
    values: {},
  };
}

describe('native Fastfetch 2.66 parity', () => {
  const nativeBinary = process.env.FASTFETCH_BIN;
  const fixture = path.resolve(process.cwd(), 'tests/fixtures/native-command.jsonc');

  test.skipIf(!nativeBinary || !existsSync(nativeBinary))('matches deterministic command output after terminal-control normalization', () => {
    const nativeOutput = execFileSync(nativeBinary as string, ['--config', fixture], { encoding: 'utf8' });
    const nativeJson = execFileSync(nativeBinary as string, ['--config', fixture, '--format', 'json'], { encoding: 'utf8' });
    const capture = parseFastfetchCapture(nativeJson);
    const modelOutput = visibleLine([commandModule], capture.values as Record<string, Record<string, string>>);
    const visibleNative = nativeOutput
      .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '')
      .replace(/\r?\n$/, '');
    expect(visibleNative).toBe(modelOutput);
  });

  test.skipIf(!nativeBinary || !existsSync(nativeBinary))('matches native default module values for a Windows capture', () => {
    const coreFixture = path.resolve(process.cwd(), 'tests/fixtures/native-core-defaults.jsonc');
    const nativeOutput = execFileSync(nativeBinary as string, ['--config', coreFixture], { encoding: 'utf8' })
      .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => line.includes(' :: '))
      .map((line) => line.slice(line.indexOf(' :: ') + 4).trim());
    const capture = parseFastfetchCapture(execFileSync(nativeBinary as string, ['--config', coreFixture, '--format', 'json'], { encoding: 'utf8' }));
    const modules = ["os", "host", "kernel", "uptime", "shell", "display", "wm", "wmtheme", "theme", "icons", "font", "cursor", "terminal", "terminalfont", "cpu", "gpu", "memory", "swap", "disk", "localip", "battery", "poweradapter", "bios", "board", "chassis", "camera", "physicalmemory", "processes", "terminalsize", "tpm", "version", "vulkan", "wifi", "users"]
      .map((type, index) => ({ id: `${type}-${index}`, type }));
    const model = buildPreviewModel(modules, { type: 'none' }, { separator: ' :: ', key: { type: 'string' } }, capture);
    const modelOutput = model.lines.filter((line) => line.kind === 'module').map((line) => line.output?.trim() || '');
    const stable = (line: string) => !/\b(?:GiB|MiB|KiB|B \/|second|minute|hour|day|mins?|hours?)\b/i.test(line) && !/^\d+$/.test(line);
    expect(modelOutput.filter(stable)).toEqual(nativeOutput.filter(stable));
  });
});
