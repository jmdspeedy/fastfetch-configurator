import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildPreviewModel } from '@/utils/fastfetchPreview';
import { parseFastfetchCapture } from '@/utils/fastfetchCapture';
import { renderTerminalStream, terminalGridText } from '@/utils/terminalBuffer';
import { fetchRemoteTemplateCatalog } from '@/utils/templateCatalog';
import { compatibilityManifest } from '@/data/templates/compatibilityManifest';
import type { DisplayConfig, LogoConfig, ModuleConfig } from '@/store/config';

const nativeBinary = process.env.FASTFETCH_BIN;
const required = process.env.FASTFETCH_PARITY_REQUIRED === '1';
const localTemplateRoot = process.env.FASTFETCH_TEMPLATE_ROOT;

function parseJsonc(source: string): Record<string, unknown> {
  let inString = false;
  let escaped = false;
  let output = '';
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    const next = source[index + 1];
    if (escaped) { output += character; escaped = false; continue; }
    if (character === '\\' && inString) { output += character; escaped = true; continue; }
    if (character === '"') { inString = !inString; output += character; continue; }
    if (!inString && character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index++;
      output += '\n';
      continue;
    }
    if (!inString && character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index++;
      index++;
      continue;
    }
    output += character;
  }
  return JSON.parse(output.replace(/,\s*([}\]])/g, '$1')) as Record<string, unknown>;
}

function normalizeParityText(lines: string[]): string {
  const withoutPrivateUseGlyphs = lines.map((line) => Array.from(line, (character) => {
    const codePoint = character.codePointAt(0) || 0;
    return (codePoint >= 0xe000 && codePoint <= 0xf8ff) || (codePoint >= 0xf0000 && codePoint <= 0xffffd) ? '¤' : character;
  }).join(''));
  return withoutPrivateUseGlyphs.map((line) => line.replace(/\d/g, '#')).join('\n').replace(/\n+$/u, '');
}

const ciNativeOnlyErrorPrefixes = [
  'Host:',
  'Bootmgr:',
  'Init System:',
  'Loadavg:',
  'Packages:',
  'Brightness:',
  'LM:',
  'DE:',
  'Wallpaper:',
  'Terminal Font:',
  'Terminal Theme:',
  'Btrfs:',
  'Zpool:',
  'Battery:',
  'Power Adapter:',
  'Media Player:',
  'Media:',
  'Public IP:',
  'Gamepad:',
  'Weather:',
  'TPM:',
  'Logo:',
];

function normalizeCiParityRows(lines: string[], referenceRows?: string[]): string[] {
  const rows = lines
    // CI enables Fastfetch's per-module statistics. Wrapped rows can place the
    // timing directly after the value, so whitespace before the suffix is not
    // guaranteed.
    .map((line) => {
      const timingOnly = /^\s*\d+(?:\.\d+)?ms$/u.test(line);
      const spacedTiming = /\s+\d+(?:\.\d+)?ms$/u.test(line);
      const hasTiming = /\d+(?:\.\d+)?ms$/u.test(line);
      const stripped = timingOnly
        ? ''
        : spacedTiming
          ? line.replace(/\s+\d+(?:\.\d+)?ms$/u, '')
          : hasTiming
            ? line.replace(/\d+(?:\.\d+)?ms$/u, '')
            : line;
      return { line: stripped, timingAttached: hasTiming && !timingOnly && !spacedTiming };
    })
    .filter(({ line }) => line.trim() !== '')
    .filter(({ line }) => !ciNativeOnlyErrorPrefixes.some((prefix) => line.trimStart().startsWith(prefix)));

  return rows
    .map(({ line, timingAttached }, index) => {
      const reference = referenceRows?.[index];
      // When the timing is attached after a wrapped value ending in digits,
      // stripping it can also consume the value's final digit (for example,
      // `AV1` followed by `265.011ms`). Restore only that numeric suffix when
      // the remaining native text is an exact prefix of the preview row.
      if (timingAttached && reference?.startsWith(line) && /^\d+$/u.test(reference.slice(line.length))) return reference;
      return line;
    });
}

function normalizeSampledIoRows(lines: string[]): string[] {
  // NetIO, DiskIO, and uptime are sampled over time by the native process. The
  // JSON capture is collected in a separate process, so those values cannot
  // be expected to match byte-for-byte; retain their labels and compare all
  // stable rows exactly.
  return lines
    .map((line) => line.replace(/^(Network IO(?: \([^)]*\))?|Disk IO \([^)]*\)):\s*.*$/u, '$1: <sampled>'))
    .map((line) => line.replace(/^(\s*Uptime\s*:\s*|\s*UPTIME\s*-\s*).*$/u, '$1<dynamic>'));
}

describe('pinned remote template parity', () => {
  test.skipIf(!required)('enumerates every remote preset and example', async () => {
    expect(nativeBinary && existsSync(nativeBinary)).toBe(true);
    const templates = localTemplateRoot
      ? compatibilityManifest.map((entry) => ({ name: entry.name, category: entry.category }))
      : await fetchRemoteTemplateCatalog();
    expect(templates.length).toBeGreaterThan(0);
    const manifestIds = new Set(compatibilityManifest.map((entry) => `${entry.category}:${entry.name}`));
    const missing = templates.filter((template) => !manifestIds.has(`${template.category}:${template.name}`));
    expect(missing, 'remote templates missing compatibility manifest entries').toEqual([]);

  }, 120_000);

  test.skipIf(!required).each(compatibilityManifest)('$category/$name matches native output with a logo-free terminal', async (entry) => {
    expect(nativeBinary && existsSync(nativeBinary)).toBe(true);
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'fastfetch-template-'));
    try {
      const configPath = path.join(tempDirectory, entry.name);
      const configText = localTemplateRoot
        ? readFileSync(path.join(localTemplateRoot, entry.category === 'example' ? 'examples' : '', entry.name), 'utf8')
        : await fetch(`https://raw.githubusercontent.com/fastfetch-cli/fastfetch/${entry.fastfetchVersion}/presets/${entry.category === 'example' ? 'examples/' : ''}${entry.name}`).then((response) => response.text());
      const config = parseJsonc(configText);
      writeFileSync(configPath, configText, 'utf8');
      const noLogoPath = path.join(tempDirectory, `no-logo-${entry.name}`);
      const nativeParityConfig = { ...config, logo: { type: 'none' } } as Record<string, unknown>;
      if (entry.name === 'ci.jsonc' && nativeParityConfig.display && typeof nativeParityConfig.display === 'object') {
        // CI's stat output is process-time-dependent and can alter wrapping;
        // parity here targets the module content rendered by the preview.
        nativeParityConfig.display = { ...(nativeParityConfig.display as Record<string, unknown>), stat: false };
      }
      writeFileSync(noLogoPath, JSON.stringify(nativeParityConfig), 'utf8');
      const nativeOutput = execFileSync(nativeBinary as string, ['--config', noLogoPath], { encoding: 'utf8', timeout: 15_000 });
      const capture = parseFastfetchCapture(execFileSync(nativeBinary as string, ['--config', configPath, '--format', 'json'], { encoding: 'utf8', timeout: 15_000 }));
      const modules: ModuleConfig[] = (Array.isArray(config.modules) ? config.modules : []).map((module, index) => typeof module === 'string'
        ? { id: `${entry.name}-${index}`, type: module }
        : { ...(module as Record<string, unknown>), id: `${entry.name}-${index}`, type: String((module as Record<string, unknown>).type || 'custom') });
      const logo: LogoConfig = config.logo === null ? { type: 'none' } : (config.logo || { type: 'auto' }) as LogoConfig;
      const display = (config.display || {}) as DisplayConfig;
      const model = buildPreviewModel(modules, logo, display, capture, (config.general || {}) as Record<string, unknown>);
      for (const width of entry.widths) {
        const nativeVisible = terminalGridText(renderTerminalStream(nativeOutput, width)).join('\n');
        const visible = terminalGridText(renderTerminalStream(model.terminalStream, width)).join('\n');
        expect(nativeVisible, `${entry.category}/${entry.name} native output at ${width} columns`).not.toContain('[60D');
        expect(visible, `${entry.category}/${entry.name} preview output at ${width} columns`).not.toMatch(/\{[#?$]|\x1b|\[[0-9]+[A-Z]/);
        const previewRows = terminalGridText(renderTerminalStream(model.terminalStream, width));
        const nativeRows = terminalGridText(renderTerminalStream(nativeOutput, width));
        const previewParityRows = entry.name === 'ci.jsonc' ? normalizeCiParityRows(previewRows) : previewRows;
        const nativeParityRows = entry.name === 'ci.jsonc' ? normalizeCiParityRows(nativeRows, previewParityRows) : nativeRows;
        const normalizedPreviewRows = normalizeSampledIoRows(previewParityRows);
        const normalizedNativeRows = normalizeSampledIoRows(nativeParityRows);
        expect(normalizeParityText(normalizedPreviewRows), `${entry.category}/${entry.name} normalized preview rows at ${width} columns`).toEqual(normalizeParityText(normalizedNativeRows));
      }
      expect(model.diagnostics.filter((diagnostic) => diagnostic.level === 'error'), entry.name).toEqual([]);
    } finally {
      rmSync(tempDirectory, { recursive: true, force: true });
    }
  }, 120_000);
});
