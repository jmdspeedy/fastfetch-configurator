import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

describe('pinned remote template parity', () => {
  test.skipIf(!required)('enumerates every remote preset and example and verifies its native stream', async () => {
    expect(nativeBinary && existsSync(nativeBinary)).toBe(true);
    const templates = await fetchRemoteTemplateCatalog();
    expect(templates.length).toBeGreaterThan(0);
    const manifestIds = new Set(compatibilityManifest.map((entry) => `${entry.category}:${entry.name}`));
    const missing = templates.filter((template) => !manifestIds.has(`${template.category}:${template.name}`));
    expect(missing, 'remote templates missing compatibility manifest entries').toEqual([]);

    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'fastfetch-parity-'));
    try {
      for (const template of templates) {
        const configText = await fetch(template.download_url).then((response) => response.text());
        const config = parseJsonc(configText);
        const fixturePath = path.join(tempDirectory, template.name);
        writeFileSync(fixturePath, configText, 'utf8');
        const nativeOutput = execFileSync(nativeBinary as string, ['--config', fixturePath], { encoding: 'utf8' });
        const capture = parseFastfetchCapture(execFileSync(nativeBinary as string, ['--config', fixturePath, '--format', 'json'], { encoding: 'utf8' }));
        const modules: ModuleConfig[] = (Array.isArray(config.modules) ? config.modules : []).map((module, index) => typeof module === 'string'
          ? { id: `${template.name}-${index}`, type: module }
          : { ...(module as Record<string, unknown>), id: `${template.name}-${index}`, type: String((module as Record<string, unknown>).type || 'custom') });
        const logo: LogoConfig = config.logo === null ? { type: 'none' } : (config.logo || { type: 'auto' }) as LogoConfig;
        const display = (config.display || {}) as DisplayConfig;
        const model = buildPreviewModel(modules, logo, display, capture, (config.general || {}) as Record<string, unknown>);
        const nativeVisible = terminalGridText(renderTerminalStream(nativeOutput, 160)).join('\n');
        const visible = terminalGridText(renderTerminalStream(model.terminalStream, 160)).join('\n');
        expect(nativeVisible).not.toContain('[60D');
        expect(visible).not.toMatch(/\{[#?$]|\x1b|\[[0-9]+[A-Z]/);
        expect(model.diagnostics.filter((diagnostic) => diagnostic.level === 'error'), template.name).toEqual([]);
      }
    } finally {
      rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});
