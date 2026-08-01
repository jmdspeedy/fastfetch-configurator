import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildPreviewModel } from '@/utils/fastfetchPreview';
import { parseFastfetchCapture } from '@/utils/fastfetchCapture';

describe('native all-module parity', () => {
  const nativeBinary = process.env.FASTFETCH_BIN;
  test.skipIf(!nativeBinary || !existsSync(nativeBinary || '') || process.platform !== 'win32')('matches all stable Windows default module output', () => {
    const bin = process.env.FASTFETCH_BIN;
    if (!bin) return;
    const fixture = path.resolve(process.cwd(), 'tests/fixtures/native-all-modules.jsonc');
    const nativeText = execFileSync(bin, ['--config', fixture], { encoding: 'utf8' })
      .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '').trim().split(/\r?\n/).filter(Boolean);
    const capture = parseFastfetchCapture(execFileSync(bin, ['--config', fixture, '--format', 'json'], { encoding: 'utf8' }));
    const modules = JSON.parse(readFileSync(fixture, 'utf8')).modules.map((type: string, index: number) => ({ id: `${type}-${index}`, type }));
    const model = buildPreviewModel(modules, { type: 'none' }, { separator: ' :: ', key: { type: 'string' } }, capture);
    const modelText = model.lines.filter((line) => line.kind === 'module').map((line) => `${line.key} :: ${line.output}`);
    const dynamic = /^(Uptime|Memory|CPU Usage|Date & Time|Network IO|Disk IO|Processes|Gamepad)/;
    expect(modelText.filter((line) => !dynamic.test(line))).toEqual(nativeText.filter((line) => !dynamic.test(line)));
  }, 20000);

  test.skipIf(!nativeBinary || !existsSync(nativeBinary || '') || process.platform !== 'win32')('matches native percentage formatting and bars', () => {
    const bin = nativeBinary as string;
    const fixture = path.resolve(process.cwd(), 'tests/fixtures/native-percent.jsonc');
    const nativeText = execFileSync(bin, ['--config', fixture], { encoding: 'utf8' }).replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '').trim().split(/\r?\n/).filter(Boolean);
    const capture = parseFastfetchCapture(execFileSync(bin, ['--config', fixture, '--format', 'json'], { encoding: 'utf8' }));
    const modules = JSON.parse(readFileSync(fixture, 'utf8')).modules.map((type: string, index: number) => ({ id: `${type}-${index}`, type }));
    const model = buildPreviewModel(modules, { type: 'none' }, { separator: ' :: ', key: { type: 'string' }, percent: { type: 3, ndigits: 1, spaceBeforeUnit: 'always' }, bar: { width: 10, char: { elapsed: '#', total: '.' }, border: { left: '[', right: ']' } } }, capture);
    const normalize = (line: string) => line
      .replace(/\[[#.█-]+\]/g, '[BAR]')
      .replace(/\d+(?:\.\d+)?\s+(?:B|KiB|MiB|GiB|TiB)/g, 'SIZE')
      .replace(/\d+(?:\.\d+)?\s*%/g, 'PERCENT');
    const modelText = model.lines.filter((line) => line.kind === 'module').map((line) => `${line.key} :: ${line.output}`);
    expect(modelText.map(normalize)).toEqual(nativeText.map(normalize));
  }, 20000);

  test.skipIf(!nativeBinary || !existsSync(nativeBinary || '') || process.platform !== 'win32')('matches native compact display formatting', () => {
    const bin = nativeBinary as string;
    const fixture = path.resolve(process.cwd(), 'tests/fixtures/native-display-compact.jsonc');
    const nativeText = execFileSync(bin, ['--config', fixture], { encoding: 'utf8' }).replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '').trim().split(/\r?\n/).filter(Boolean);
    const capture = parseFastfetchCapture(execFileSync(bin, ['--config', fixture, '--format', 'json'], { encoding: 'utf8' }));
    const model = buildPreviewModel([{ id: 'display', type: 'display', compactType: 'original-with-refresh-rate', preciseRefreshRate: true }], { type: 'none' }, { separator: ' :: ', key: { type: 'string' } }, capture);
    expect(model.lines.filter((line) => line.kind === 'module').map((line) => `${line.key} :: ${line.output}`)).toEqual(nativeText);
  }, 20000);

  test.skipIf(!nativeBinary || !existsSync(nativeBinary || '') || process.platform !== 'win32')('matches native size and frequency precision', () => {
    const bin = nativeBinary as string;
    const fixture = path.resolve(process.cwd(), 'tests/fixtures/native-precision.jsonc');
    const nativeText = execFileSync(bin, ['--config', fixture], { encoding: 'utf8' }).replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '').trim().split(/\r?\n/).filter(Boolean);
    const capture = parseFastfetchCapture(execFileSync(bin, ['--config', fixture, '--format', 'json'], { encoding: 'utf8' }));
    const modules = ['memory', 'cpu', 'gpu'].map((type, index) => ({ id: `${type}-${index}`, type }));
    const model = buildPreviewModel(modules, { type: 'none' }, { separator: ' :: ', key: { type: 'string' }, size: { ndigits: 1 }, freq: { ndigits: 1, spaceBeforeUnit: 'never' } }, capture);
    const dynamic = /^(Memory|GPU)/;
    const normalize = (line: string) => line.replace(/\d+(?:\.\d+)?\s+(?:B|KiB|MiB|GiB|TiB)/g, 'SIZE').replace(/\d+(?:\.\d+)?\s*GHz/g, 'FREQ');
    const modelText = model.lines.filter((line) => line.kind === 'module').map((line) => `${line.key} :: ${line.output}`);
    expect(modelText.filter((line) => !dynamic.test(line)).map(normalize)).toEqual(nativeText.filter((line) => !dynamic.test(line)).map(normalize));
    expect(modelText.filter((line) => line.startsWith('GPU')).map(normalize)).toEqual(nativeText.filter((line) => line.startsWith('GPU')).map(normalize));
  }, 20000);
});
