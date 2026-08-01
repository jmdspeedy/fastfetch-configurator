'use client';

import { useMemo, useRef, useState } from 'react';
import { useConfigStore, LogoConfig } from '@/store/config';
import { getLogoData, resolvePreviewLogoName } from '@/utils/logos';
import { buildPreviewModel } from '@/utils/fastfetchPreview';
import { kaliPreviewProfile, previewProfiles, PreviewProfile } from '@/data/previewProfiles';
import { getCaptureCommand, parseFastfetchCapture } from '@/utils/fastfetchCapture';
import { renderTerminalStream, TerminalCell, TerminalGrid } from '@/utils/terminalBuffer';

const SAMPLE_PROFILES: Array<{ id: string; profile: PreviewProfile }> = [
  { id: 'linux', profile: previewProfiles.linux },
  { id: 'kali', profile: kaliPreviewProfile },
  { id: 'windows', profile: previewProfiles.windows },
  { id: 'macos', profile: previewProfiles.macos },
];

const COLOR_VALUES: Record<string, string> = {
  black: '#111827', red: '#ef4444', green: '#22c55e', yellow: '#eab308', blue: '#3b82f6',
  magenta: '#ec4899', cyan: '#06b6d4', white: '#f3f4f6', bright_black: '#6b7280',
  bright_red: '#f87171', bright_green: '#4ade80', bright_yellow: '#fde047', bright_blue: '#60a5fa',
  bright_magenta: '#f472b6', bright_cyan: '#67e8f9', bright_white: '#ffffff', default: '#d1d5db',
};

function cellStyle(cell: TerminalCell): React.CSSProperties {
  return {
    color: cell.foreground?.startsWith('#') ? cell.foreground : COLOR_VALUES[cell.foreground || 'default'],
    backgroundColor: cell.background?.startsWith('#') ? cell.background : cell.background ? COLOR_VALUES[cell.background] : undefined,
    fontWeight: cell.bold ? 700 : undefined,
    opacity: cell.dim ? 0.7 : undefined,
    fontStyle: cell.italic ? 'italic' : undefined,
    textDecoration: cell.underline ? 'underline' : undefined,
  };
}

function cellClassName(cell: TerminalCell): string | undefined {
  const codePoint = cell.char.codePointAt(0) ?? -1;
  const isPrivateUse = (codePoint >= 0xE000 && codePoint <= 0xF8FF)
    || (codePoint >= 0xF0000 && codePoint <= 0xFFFFD)
    || (codePoint >= 0x100000 && codePoint <= 0x10FFFD);
  return isPrivateUse ? 'terminal-symbol' : undefined;
}

function logoColorToAnsi(value: string): string {
  const normalized = value.replace(/^text-/, '').replace(/-(\d{2,3})$/, '');
  const color = normalized === 'gray' ? 'white' : normalized;
  const codes: Record<string, string> = { black: '30', red: '31', green: '32', yellow: '33', blue: '34', pink: '35', magenta: '35', cyan: '36', white: '37' };
  return `\x1b[${codes[color] || '37'}m`;
}

function logoStream(logo: LogoConfig, profile: PreviewProfile): { stream: string; width: number } {
  const name = resolvePreviewLogoName(logo, profile);
  if (!name || logo.type === 'none') return { stream: '', width: 0 };
  const data = logo._customContent ? null : getLogoData(name);
  if (!data) return { stream: '', width: 0 };
  const colors = Array.isArray(logo.color)
    ? Object.fromEntries((logo.color as unknown[]).map((color, index) => [String(index + 1), String(color)]))
    : typeof logo.color === 'object' && logo.color ? logo.color as Record<string, string> : undefined;
  const lines = (logo._customContent || data.ascii).split('\n');
  const width = Math.max(0, ...lines.map((line) => line.replace(/\$[1-9]/g, '').length)) + (logo.padding?.left || 0) + (logo.padding?.right || 0);
  const stream = lines.map((line) => {
    let current = colors?.['1'] || data.colors[0] || 'white';
    const rendered = line.split(/(\$[1-9])/g).map((part) => {
      if (/^\$[1-9]$/.test(part)) {
        current = colors?.[part[1]] || data.colors[Number(part[1]) - 1] || current;
        return logoColorToAnsi(current);
      }
      return part;
    }).join('');
    return `${' '.repeat(logo.padding?.left || 0)}${rendered}${' '.repeat(logo.padding?.right || 0)}`;
  }).join('\n');
  return { stream, width };
}

function mergePreviewGrids(moduleGrid: TerminalGrid, logoGrid: TerminalGrid, position: string, columns: number): TerminalGrid {
  const height = position === 'top' ? logoGrid.rows + moduleGrid.rows : Math.max(logoGrid.rows, moduleGrid.rows);
  const cells: TerminalCell[][] = Array.from({ length: height }, () => Array.from({ length: columns }, () => ({ char: ' ', foreground: 'default' })));
  const copy = (source: TerminalGrid, sourceRow: number, row: number, offset: number) => {
    if (row < 0 || row >= cells.length) return;
      source.cells[sourceRow]?.forEach((cell, sourceColumn) => {
        const targetColumn = sourceColumn + offset;
      if (targetColumn >= 0 && targetColumn < columns && (cell.char !== ' ' || cell.background !== undefined)) cells[row][targetColumn] = cell;
    });
  };
  const logoOffset = logoGrid.columns;
  if (position !== 'right') {
    for (let row = 0; row < logoGrid.rows; row++) copy(logoGrid, row, row, 0);
  }
  const moduleOffset = position === 'left' ? logoOffset + (logoGrid.columns > 0 ? 2 : 0) : position === 'right' ? 0 : 0;
  for (let row = 0; row < moduleGrid.rows; row++) copy(moduleGrid, row, position === 'top' ? row + logoGrid.rows : row, moduleOffset);
  if (position === 'right') {
    const rightOffset = Math.max(0, columns - logoGrid.columns);
    for (let row = 0; row < logoGrid.rows; row++) copy(logoGrid, row, row, rightOffset);
  }
  return { columns, rows: height, cursor: moduleGrid.cursor, cells };
}

export default function TerminalPreview() {
  const { modules, logo, display, general, previewSupport, loadError } = useConfigStore();
  const [sampleId, setSampleId] = useState('linux');
  const [capture, setCapture] = useState<PreviewProfile | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [terminalColumns, setTerminalColumns] = useState(100);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const activeProfile = capture || SAMPLE_PROFILES.find((sample) => sample.id === sampleId)?.profile || previewProfiles.linux;
  const model = useMemo(() => buildPreviewModel(modules, logo, display, activeProfile, general), [modules, logo, display, activeProfile, general]);
  const terminal = useMemo(() => {
    const moduleGrid = renderTerminalStream(model.terminalStream, terminalColumns);
    const logoData = logoStream(logo, activeProfile);
    const logoGrid = renderTerminalStream(logoData.stream, Math.max(1, logoData.width));
    return mergePreviewGrids(moduleGrid, logoGrid, String(logo.position || 'left'), terminalColumns);
  }, [activeProfile, logo, model.terminalStream, terminalColumns]);
  const unsupportedFeatures = [...new Set([...model.unsupportedFeatures, ...previewSupport.features])];

  return (
    <div className="bg-black rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-mono text-sm h-full min-h-[520px] flex flex-col">
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" /></div>
        <div className="flex-1 text-center text-gray-400 text-xs">sample@fastfetch-config: ~</div>
        <div className="flex items-center gap-2">
          {!capture && <label className="text-[10px] text-gray-500 flex items-center gap-1">Sample
            <select value={sampleId} onChange={(event) => setSampleId(event.target.value)} className="bg-[#252525] text-gray-300 border border-gray-600 rounded px-1 py-0.5">
              {SAMPLE_PROFILES.map(({ id, profile }) => <option key={id} value={id}>{profile.label}</option>)}
            </select>
          </label>}
          {capture && <span className="text-[10px] text-emerald-300">{activeProfile.label}</span>}
          <label className="text-[10px] text-gray-500 flex items-center gap-1">Cols
            <select value={terminalColumns} onChange={(event) => setTerminalColumns(Number(event.target.value))} className="bg-[#252525] text-gray-300 border border-gray-600 rounded px-1 py-0.5">
              {[80, 100, 120, 160].map((columns) => <option key={columns} value={columns}>{columns}</option>)}
            </select>
          </label>
          <input ref={captureInputRef} type="file" accept=".json,.jsonc" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try { setCapture(parseFastfetchCapture(String(reader.result || ''))); setCaptureError(null); }
              catch (error) { setCaptureError(error instanceof Error ? error.message : 'Invalid Fastfetch capture'); }
            };
            reader.readAsText(file);
            event.target.value = '';
          }} />
          <button type="button" title={`Run ${getCaptureCommand(activeProfile.id)}, then load the JSON file`} onClick={() => captureInputRef.current?.click()} className="text-[10px] text-gray-400 hover:text-white border border-gray-600 rounded px-1.5 py-0.5">Load capture</button>
          {capture && <button type="button" onClick={() => setCapture(null)} className="text-[10px] text-gray-400 hover:text-white border border-gray-600 rounded px-1.5 py-0.5">Sample</button>}
        </div>
      </div>

      <div className="p-5 overflow-auto custom-scrollbar flex-1">
        {loadError ? (
          <div className="rounded border border-red-700/60 bg-red-950/30 p-4 text-sm text-red-200">
            <div className="font-semibold">Configuration could not be imported</div>
            <p className="mt-1 text-red-300/80">The previous configuration remains active. {loadError}</p>
          </div>
        ) : unsupportedFeatures.length > 0 ? (
          <div className="rounded border border-amber-700/60 bg-amber-950/30 p-4 text-sm text-amber-200">
            <div className="font-semibold">Accurate preview unavailable</div>
            <p className="mt-1 text-amber-300/80">This configuration uses terminal or host-only features that the browser cannot verify.</p>
            <ul className="mt-3 list-disc pl-5 text-xs space-y-1">{unsupportedFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
        ) : (
          <div className="leading-[1.35] whitespace-pre" style={{ width: `${terminalColumns}ch`, minWidth: `${terminalColumns}ch` }} role="img" aria-label={`${activeProfile.label} Fastfetch terminal preview`}>
            {terminal.cells.map((row, rowIndex) => (
              <div key={rowIndex} className="h-[1.35em]">{row.map((cell, columnIndex) => <span key={`${rowIndex}-${columnIndex}`} className={cellClassName(cell)} style={cellStyle(cell)}>{cell.char}</span>)}</div>
            ))}
          </div>
        )}
        {model.diagnostics.filter((diagnostic) => diagnostic.level !== 'error').length > 0 && (
          <div className="mt-5 border-t border-gray-800 pt-3 text-[11px] text-gray-500 space-y-1">
            {model.diagnostics.filter((diagnostic) => diagnostic.level !== 'error').map((diagnostic, index) => <div key={`${diagnostic.message}-${index}`}>ⓘ {diagnostic.message}</div>)}
          </div>
        )}
        {captureError && <div className="mt-3 text-[11px] text-red-300">Capture error: {captureError}</div>}
      </div>
    </div>
  );
}
