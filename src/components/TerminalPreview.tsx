'use client';

import { useMemo, useRef, useState } from 'react';
import { useConfigStore, LogoConfig } from '@/store/config';
import { getLogoData } from '@/utils/logos';
import { buildPreviewModel, PreviewSegment } from '@/utils/fastfetchPreview';
import { previewProfiles, PreviewPlatform, PreviewProfile } from '@/data/previewProfiles';
import { getCaptureCommand, parseFastfetchCapture } from '@/utils/fastfetchCapture';
import clsx from 'clsx';
import Ansi from 'ansi-to-react';

function colorClass(color?: string) {
  if (!color) return 'text-gray-300';
  if (color.startsWith('text-')) return color;
  const normalized = color.replace(/^(reset_|bright_|light_|dim_|italic_|underline_|blink_|inverse_)+/g, '');
  const map: Record<string, string> = {
    black: 'text-gray-900', red: 'text-red-500', green: 'text-green-500', yellow: 'text-yellow-500',
    blue: 'text-blue-500', magenta: 'text-pink-500', cyan: 'text-cyan-500', white: 'text-gray-100', default: 'text-gray-300',
  };
  return map[normalized] || 'text-gray-300';
}

function segmentStyle(segment: PreviewSegment) {
  const style: React.CSSProperties = {};
  if (segment.color?.startsWith('#')) style.color = segment.color;
  if (segment.color?.startsWith('@')) style.color = '#d1d5db';
  return style;
}

function renderSegments(segments: PreviewSegment[], fallbackColor?: string) {
  return segments.map((segment, index) => (
    <span
      key={`${segment.text}-${index}`}
      className={clsx(colorClass(segment.color || fallbackColor), segment.bold && 'font-bold', segment.italic && 'italic', segment.underline && 'underline')}
      style={segmentStyle(segment)}
    >
      {segment.text}
    </span>
  ));
}

function LogoPreview({ logo }: { logo: LogoConfig }) {
  const logoName = logo.source || logo._presetName || 'Arch';
  const logoData = getLogoData(logoName) || getLogoData('Arch');
  if (logo.type === 'none') return null;
  if (!logo._customContent && !getLogoData(logoName) && logo.type !== 'auto') {
    return <div className="text-[11px] text-amber-300 whitespace-pre">[logo source unavailable in browser: {logo.source || logo.type}]</div>;
  }

  const renderLine = (line: string, index: number) => {
    if (!logoData) return null;
    const colors = Array.isArray(logo.color)
      ? Object.fromEntries((logo.color as unknown[]).map((color, index) => [String(index + 1), String(color)]))
      : typeof logo.color === 'object' && logo.color ? logo.color as Record<string, string> : undefined;
    let currentColor = colors?.['1'] || logoData.colors[0] || 'text-gray-200';
    const parts = line.split(/(\$[1-9])/g);
    return (
      <div key={index} className="whitespace-pre leading-tight">
        {parts.map((part, partIndex) => {
          if (/^\$[1-9]$/.test(part)) {
            currentColor = colors?.[part[1]] || logoData.colors[Number(part[1]) - 1] || currentColor;
            return null;
          }
          return part ? <span key={partIndex} className={colorClass(currentColor)}>{part}</span> : null;
        })}
      </div>
    );
  };

  return (
    <div
      className="font-bold whitespace-pre select-none"
      style={{
        paddingTop: `${logo.padding?.top || 0}em`,
        paddingBottom: `${logo.padding?.bottom || 0}em`,
        paddingLeft: `${logo.padding?.left || 0}ch`,
        paddingRight: `${logo.padding?.right || 0}ch`,
      }}
    >
      {logo._customContent ? <Ansi>{logo._customContent}</Ansi> : logoData?.ascii.split('\n').map(renderLine)}
    </div>
  );
}

export default function TerminalPreview() {
  const { modules, logo, display } = useConfigStore();
  const [platform, setPlatform] = useState<PreviewPlatform>('linux');
  const [capture, setCapture] = useState<PreviewProfile | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [terminalColumns, setTerminalColumns] = useState(100);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const activeProfile = capture || previewProfiles[platform];
  const model = useMemo(() => buildPreviewModel(modules, logo, display, activeProfile), [modules, logo, display, activeProfile]);
  const logoPosition = logo.position || 'left';
  const lineWrapClass = display.disableLinewrap === true ? 'whitespace-pre' : 'whitespace-pre-wrap break-all';
  const moduleContent = (
    <div className="flex flex-col gap-0 min-w-0">
      {model.lines.map((line) => {
        if (line.kind === 'break') return <div key={line.id} className="h-4" />;
        if (line.kind === 'colors') {
          return <div key={line.id} className="mt-2 flex whitespace-pre" aria-label="Fastfetch color palette">
            {(line.colorBlocks || []).map((block) => <span key={block.index} style={{ backgroundColor: block.background }}>{block.text}</span>)}
          </div>;
        }
        const lineClass = line.kind === 'title' ? 'font-bold' : lineWrapClass;
        return <div key={line.id} className={lineClass}>{renderSegments(line.segments, line.outputColor)}</div>;
      })}
    </div>
  );

  return (
    <div className="bg-black/90 rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-mono text-sm h-full flex flex-col">
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" /></div>
        <div className="flex-1 text-center text-gray-400 text-xs">user@fastfetch-config: ~</div>
        <div className="flex items-center gap-1">
          {!capture && <label className="text-[10px] text-gray-500 flex items-center gap-1">Sample
            <select value={platform} onChange={(event) => setPlatform(event.target.value as PreviewPlatform)} className="bg-[#252525] text-gray-300 border border-gray-600 rounded px-1 py-0.5">
              {Object.values(previewProfiles).map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
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
          <button type="button" title={`Run “${getCaptureCommand(platform)}”, then load the JSON file`} onClick={() => captureInputRef.current?.click()} className="text-[10px] text-gray-400 hover:text-white border border-gray-600 rounded px-1.5 py-0.5">Load capture</button>
          {capture && <button type="button" onClick={() => setCapture(null)} className="text-[10px] text-gray-400 hover:text-white border border-gray-600 rounded px-1.5 py-0.5">Sample</button>}
        </div>
      </div>

      <div className="p-6 text-gray-300 overflow-auto custom-scrollbar flex-1">
        <div style={{ width: `${terminalColumns}ch`, maxWidth: '100%' }} className={clsx('flex gap-0', logoPosition === 'top' && 'flex-col', logoPosition === 'right' && 'flex-row-reverse')}>
          <LogoPreview logo={logo} />
          {moduleContent}
        </div>
        {model.diagnostics.length > 0 && (
          <div className="mt-6 border-t border-amber-900/50 pt-3 text-[11px] text-amber-300 space-y-1">
            {model.diagnostics.map((diagnostic, index) => <div key={`${diagnostic.message}-${index}`}>ⓘ {diagnostic.message}</div>)}
          </div>
        )}
        {captureError && <div className="mt-3 text-[11px] text-red-300">Capture error: {captureError}</div>}
      </div>
    </div>
  );
}
