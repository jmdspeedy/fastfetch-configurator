import { describe, expect, test } from 'vitest';
import { buildPreviewModel } from '@/utils/fastfetchPreview';
import { renderTerminalStream, terminalGridText } from '@/utils/terminalBuffer';
import { resolvePreviewLogoName } from '@/utils/logos';
import { buildConfigDocument } from '@/utils/configExport';
import { kaliPreviewProfile } from '@/data/previewProfiles';

describe('terminal-cell preview semantics', () => {
  test('consumes Fastfetch color tokens and constants', () => {
    const model = buildPreviewModel([
      { id: 'custom', type: 'custom', format: '{#90}{$1}{#}' },
    ], { type: 'none' }, { constants: ['Kali'] }, { id: 'linux', label: 'Kali sample', architecture: 'x86_64', values: {} });
    expect(model.lines[0]?.output).toBe('Kali');
    expect(model.terminalStream).not.toContain('{$1}');
    expect(model.terminalStream).not.toContain('{#90}');
    expect(model.lines[0]?.segments.some((segment) => segment.color === 'bright_black')).toBe(true);
  });

  test('moves the cursor for CSI D without printing the control sequence', () => {
    const grid = renderTerminalStream('1234567890\x1b[5Dab', 20);
    expect(terminalGridText(grid)).toEqual(['12345ab890']);
  });

  test('resolves automatic logos from the active sample without changing export semantics', () => {
    const logo = { type: 'auto' as const };
    expect(resolvePreviewLogoName(logo, kaliPreviewProfile)).toBe('Kali');
    expect(buildConfigDocument([], logo, {}).logo).toEqual({ type: 'auto' });
  });

  test('preserves a cursor-driven bordered two-column layout', () => {
    const grid = renderTerminalStream('┌────┐\n│left│\x1b[6Dright\n└────┘', 24);
    expect(terminalGridText(grid)).toEqual(['┌────┐', 'right│', '└────┘']);
    expect(terminalGridText(grid).join('\n')).not.toContain('[6D');
  });

  test.each([80, 100, 120, 160])('wraps at %i terminal columns', (columns) => {
    const grid = renderTerminalStream('x'.repeat(columns + 1), columns);
    expect(grid.rows).toBe(2);
    expect(terminalGridText(grid)[0]).toHaveLength(columns);
    expect(terminalGridText(grid)[1]).toBe('x');
  });
});
