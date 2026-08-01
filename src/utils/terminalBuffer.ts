export interface TerminalStyle {
  foreground?: string;
  background?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface TerminalCell extends TerminalStyle {
  char: string;
}

export interface TerminalGrid {
  columns: number;
  rows: number;
  cursor: { x: number; y: number };
  cells: TerminalCell[][];
}

const DEFAULT_STYLE: TerminalStyle = { foreground: 'default' };

function blankCell(style: TerminalStyle = DEFAULT_STYLE): TerminalCell {
  return { char: ' ', ...style };
}

function sgrColor(code: number, bright: boolean): string | undefined {
  const colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const color = colors[code - (bright ? 90 : 30)];
  return color ? (bright ? `bright_${color}` : color) : undefined;
}

function xtermColor(index: number): string {
  const base = ['#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];
  if (index < 16) return base[index];
  if (index >= 232) {
    const gray = 8 + ((index - 232) * 10);
    return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
  }
  const value = index - 16;
  const r = Math.floor(value / 36);
  const g = Math.floor((value % 36) / 6);
  const b = value % 6;
  const channel = (part: number) => part === 0 ? 0 : 55 + part * 40;
  return `#${[channel(r), channel(g), channel(b)].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const number = value === undefined || value === '' ? fallback : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * A deliberately small terminal emulator for Fastfetch output. It handles
 * printable text, SGR styling, cursor movement, erasing, and wrapping—the
 * control surface used by the pinned preset corpus.
 */
export function renderTerminalStream(stream: string, columns = 120, rows = 200): TerminalGrid {
  const width = Math.max(1, Math.floor(columns));
  const height = Math.max(1, Math.floor(rows));
  const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => blankCell()));
  let x = 0;
  let y = 0;
  let savedCursor = { x: 0, y: 0 };
  let style: TerminalStyle = { ...DEFAULT_STYLE };
  let wrapPending = false;

  const clampCursor = () => {
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
  };
  const moveRow = (amount: number) => { y = Math.max(0, Math.min(height - 1, y + amount)); };
  const eraseLine = (mode: number) => {
    if (mode === 2) {
      for (let index = 0; index < width; index++) cells[y][index] = blankCell(style);
    } else if (mode === 1) {
      for (let index = 0; index <= x; index++) cells[y][index] = blankCell(style);
    } else {
      for (let index = x; index < width; index++) cells[y][index] = blankCell(style);
    }
  };
  const eraseDisplay = (mode: number) => {
    if (mode === 2) {
      for (const row of cells) for (let index = 0; index < width; index++) row[index] = blankCell(style);
    } else if (mode === 1) {
      for (let row = 0; row <= y; row++) for (let index = 0; index < width; index++) {
        if (row < y || index <= x) cells[row][index] = blankCell(style);
      }
    } else {
      for (let row = y; row < height; row++) for (let index = 0; index < width; index++) {
        if (row > y || index >= x) cells[row][index] = blankCell(style);
      }
    }
  };
  const applySgr = (params: number[]) => {
    if (params.length === 0) params = [0];
    for (let index = 0; index < params.length; index++) {
      const code = params[index];
      if (code === 0) style = { ...DEFAULT_STYLE };
      else if (code === 1) style.bold = true;
      else if (code === 2) style.dim = true;
      else if (code === 3) style.italic = true;
      else if (code === 4) style.underline = true;
      else if (code === 22) { style.bold = false; style.dim = false; }
      else if (code === 23) style.italic = false;
      else if (code === 24) style.underline = false;
      else if (code === 39) style.foreground = DEFAULT_STYLE.foreground;
      else if (code === 49) style.background = undefined;
      else if (code >= 30 && code <= 37) style.foreground = sgrColor(code, false);
      else if (code >= 90 && code <= 97) style.foreground = sgrColor(code, true);
      else if (code >= 40 && code <= 47) style.background = sgrColor(code - 10, false);
      else if (code >= 100 && code <= 107) style.background = sgrColor(code - 10, true);
      else if ((code === 38 || code === 48) && params[index + 1] === 5) {
        const color = xtermColor(parseNumber(String(params[index + 2]), 0));
        if (code === 38) style.foreground = color; else style.background = color;
        index += 2;
      } else if ((code === 38 || code === 48) && params[index + 1] === 2) {
        const rgb = params.slice(index + 2, index + 5).map((part) => Math.max(0, Math.min(255, part)));
        if (rgb.length === 3) {
          const color = `#${rgb.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
          if (code === 38) style.foreground = color; else style.background = color;
        }
        index += 4;
      }
    }
  };

  // CSI is parsed before printable text, so raw fragments such as ESC[60D
  // can never reach the cell buffer as visible characters.
  const csi = /\x1b\[([0-9;?]*)([ -\/]*)([@-~])/y;
  const osc = /\x1b\][^\x07]*(?:\x07|\x1b\\)/y;
  let index = 0;
  while (index < stream.length) {
    csi.lastIndex = index;
    const csiMatch = csi.exec(stream);
    if (csiMatch) {
      const params = csiMatch[1].replace(/^\?/, '').split(';').filter(Boolean).map(Number);
      const final = csiMatch[3];
      const amount = Math.max(1, parseNumber(String(params[0]), 1));
      if (final === 'm') applySgr(params);
      else if (final === 'C' || final === 'a') x += amount;
      else if (final === 'D') x -= amount;
      else if (final === 'A') moveRow(-amount);
      else if (final === 'B' || final === 'e') moveRow(amount);
      else if (final === 'E') { moveRow(amount); x = 0; }
      else if (final === 'F') { moveRow(-amount); x = 0; }
      else if (final === 'G' || final === '`') x = Math.max(0, amount - 1);
      else if (final === 'd') y = Math.max(0, amount - 1);
      else if (final === 'H' || final === 'f') { y = Math.max(0, (params[0] || 1) - 1); x = Math.max(0, (params[1] || 1) - 1); }
      else if (final === 's') savedCursor = { x, y };
      else if (final === 'u') { x = savedCursor.x; y = savedCursor.y; }
      else if (final === 'J') eraseDisplay(params[0] || 0);
      else if (final === 'K') eraseLine(params[0] || 0);
      else if (final === 'P') {
        const count = Math.min(width - x, amount);
        cells[y].splice(x, count);
        cells[y].push(...Array.from({ length: count }, () => blankCell(style)));
      } else if (final === '@') {
        const count = Math.min(width - x, amount);
        cells[y].splice(x, 0, ...Array.from({ length: count }, () => blankCell(style)));
        cells[y].length = width;
      }
      clampCursor();
      index = csi.lastIndex;
      wrapPending = false;
      continue;
    }
    osc.lastIndex = index;
    const oscMatch = osc.exec(stream);
    if (oscMatch) { index = osc.lastIndex; continue; }
    const character = stream[index];
    if (character === '\x1b' && stream[index + 1] === '7') {
      savedCursor = { x, y };
      index += 2;
      continue;
    }
    if (character === '\x1b' && stream[index + 1] === '8') {
      x = savedCursor.x;
      y = savedCursor.y;
      clampCursor();
      index += 2;
      continue;
    }
    if (character === '\x1b') { index += 1; continue; }
    if (character === '\r') { x = 0; wrapPending = false; index += 1; continue; }
    if (character === '\n') { moveRow(1); x = 0; wrapPending = false; index += 1; continue; }
    if (character === '\b') { x = Math.max(0, x - 1); wrapPending = false; index += 1; continue; }
    if (character === '\t') { x = Math.min(width - 1, x + (8 - (x % 8))); index += 1; continue; }
    if (character < ' ') { index += 1; continue; }
    if (wrapPending) { x = 0; moveRow(1); wrapPending = false; }
    cells[y][x] = { char: character, ...style };
    if (x === width - 1) wrapPending = true;
    else x += 1;
    index += 1;
  }

  let lastRow = 0;
  for (let row = height - 1; row >= 0; row--) {
    if (cells[row].some((cell) => cell.char !== ' ' || cell.background !== undefined)) { lastRow = row; break; }
  }
  return { columns: width, rows: lastRow + 1, cursor: { x, y }, cells: cells.slice(0, lastRow + 1) };
}

export function terminalGridText(grid: TerminalGrid, trimRight = true): string[] {
  return grid.cells.map((row) => {
    const text = row.map((cell) => cell.char).join('');
    return trimRight ? text.replace(/\s+$/u, '') : text;
  });
}

export function stripTerminalControls(value: string): string {
  return terminalGridText(renderTerminalStream(value, Math.max(80, value.length + 1))).join('\n');
}
