'use client';

import { useConfigStore, ModuleConfig } from '@/store/config';
import { getLogoData } from '@/utils/logos';
import clsx from 'clsx';
import Ansi from 'ansi-to-react';

// Mapping module types to dummy data
const getModuleContent = (module: ModuleConfig, displaySeparator: string = ': ') => {
  const key = module.key || module.type;
  let value = '';

  switch (module.type) {
    case 'Title': return { type: 'title', value: 'user@hostname' };
    case 'Separator': return { type: 'separator', value: '-------------------' };
    case 'OS': value = 'Arch Linux x86_64'; break;
    case 'Host': value = 'KVM/QEMU (Standard PC)'; break;
    case 'Kernel': value = '6.6.13-linux'; break;
    case 'Uptime': value = '42 mins'; break;
    case 'Packages': value = '1203 (pacman)'; break;
    case 'Shell': value = 'bash 5.2.21'; break;
    case 'Display': value = '1920x1080 @ 60Hz'; break;
    case 'DE': value = 'GNOME 45.3'; break;
    case 'WM': value = 'Mutter'; break;
    case 'WMTheme': value = 'Adwaita'; break;
    case 'Theme': value = 'Adwaita [GTK2/3]'; break;
    case 'Icons': value = 'Adwaita [GTK2/3]'; break;
    case 'Font': value = 'Cantarell (11pt)'; break;
    case 'Cursor': value = 'Adwaita'; break;
    case 'Terminal': value = 'gnome-terminal'; break;
    case 'TerminalFont': value = 'Monospace (12pt)'; break;
    case 'CPU': value = 'AMD Ryzen 9 5950X (4) @ 3.4GHz'; break;
    case 'GPU': value = 'Red Hat QXL Paravirtual Graphic Card'; break;
    case 'Memory': value = '1.21 GiB / 16.00 GiB'; break;
    case 'Swap': value = '0 B / 4.00 GiB'; break;
    case 'Disk': value = '15.4 GiB / 50.0 GiB (31%)'; break;
    case 'Battery': value = '100% [Charging]'; break;
    case 'PowerAdapter': value = '65W'; break;
    case 'Player': value = 'Spotify'; break;
    case 'Media': value = 'Never Gonna Give You Up - Rick Astley'; break;
    case 'LocalIP': value = '192.168.1.45'; break;
    case 'PublicIP': value = '203.0.113.1'; break;
    case 'Wifi': value = 'MyWifi (70%)'; break;
    case 'DateTime': value = '2024-05-20 14:30:00'; break;
    case 'Colors': return { type: 'colors', value: '' };
    case 'Break': return { type: 'break', value: '' };
    case 'Command':
    case 'command':
      // Show the command output placeholder
      value = module.text ? `$(output of "${module.text}")` : '$(command output)';
      break;
    case 'File':
    case 'file':
      // Show file path placeholder
      value = module.source ? `[File: ${module.source}]` : '[File Content]';
      break;
    case 'Custom':
    case 'custom':
    case 'Text':
    case 'text':
      // Show custom text
      value = module.text || module.format || 'Custom Text';
      break;
    default: value = '...';
  }

  return { type: 'info', key, value, separator: displaySeparator };
};

export default function TerminalPreview() {
  const { modules, logo, display } = useConfigStore();

  // Determine Logo Data
  // Prefer explicit source, fallback to preset name (legacy), fallback to Arch
  const logoName = logo.source || logo._presetName || 'Arch';
  const logoData = getLogoData(logoName) || getLogoData('Arch');

  // Helper to render a single line of the logo with colors
  const renderLogoLine = (line: string, lineIndex: number) => {
    if (!logoData) return null;
    const { colors } = logoData;

    // Use first color as default if no markers
    let currentColor = colors[0] || 'text-gray-200';

    // If line has no markers, render directly
    if (!line.includes('$')) {
      // Use div to ensure line break, handle empty lines
      return <div key={lineIndex} className={currentColor}>{line || '\u00A0'}</div>;
    }

    // Split by $1-$9 markers
    const parts = line.split(/(\$[1-9])/g);

    return (
      <div key={lineIndex} className="whitespace-pre">
        {parts.map((part, i) => {
          // If part is a marker, update current color
          if (part.match(/^\$[1-9]$/)) {
            const colorIndex = parseInt(part[1]) - 1;
            currentColor = colors[colorIndex] || 'text-gray-200';
            return null; // Don't render the marker
          }
          // If empty part (e.g. string starts with marker), skip
          if (!part) return null;

          return <span key={i} className={currentColor}>{part}</span>;
        })}
      </div>
    );
  };

  const separator = display.separator || ': ';
  const keyColor = display.color?.keys || 'blue';
  const titleColor = display.color?.title || 'blue';
  const outputColor = display.color?.output || 'default';
  const separatorColor = display.color?.separator || 'default';

  // Tailwind map for simple color names
  // Tailwind map for simple color names
  const getColorClass = (colorName?: string) => {
    if (!colorName) return 'text-gray-200'; // Default text color

    // Normalize (handle bold_, bright_, etc. by stripping locally for preview simplicity)
    // In a real terminal emulator we'd handle brightness, but for a simple preview:
    const normalized = colorName.replace(/^(bold_|bright_|italic_|underline_|blink_)+/, '');

    const map: Record<string, string> = {
      black: 'text-gray-900', red: 'text-red-500', green: 'text-green-500',
      yellow: 'text-yellow-500', blue: 'text-blue-500', magenta: 'text-pink-500',
      cyan: 'text-cyan-500', white: 'text-gray-100', default: 'text-gray-300'
    };

    return map[normalized] || map[colorName] || 'text-gray-300';
  };

  return (
    <div className="bg-black/90 rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-mono text-sm h-full flex flex-col">
      {/* Terminal Title Bar */}
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="flex-1 text-center text-gray-400 text-xs">user@fastfetch-config: ~</div>
      </div>

      {/* Terminal Content */}
      <div className="p-6 text-gray-300 overflow-auto">
        <div className="flex gap-6">
          {/* Logo */}
          <div className="font-bold whitespace-pre leading-tight select-none">
            {logo._customContent ? (
              <Ansi>{logo._customContent}</Ansi>
            ) : (
              logoData?.ascii.split('\n').map((line, i) => renderLogoLine(line, i))
            )}
          </div>

          {/* Info Modules */}
          <div className="flex flex-col gap-0.5">
            {modules.map((m) => {
              const data = getModuleContent(m, separator);

              if (data.type === 'title') {
                return (
                  <div key={m.id} className="mb-1">
                    <span className={clsx("font-bold", getColorClass(titleColor))}>user</span>
                    <span className={clsx("font-bold", getColorClass(separatorColor))}>@</span>
                    <span className={clsx("font-bold", getColorClass(titleColor))}>hostname</span>
                  </div>
                );
              }

              if (data.type === 'separator') {
                return <div key={m.id} className="text-gray-500 mb-1">{data.value}</div>;
              }

              if (data.type === 'break') {
                return <div key={m.id} className="h-4"></div>;
              }

              if (data.type === 'colors') {
                return (
                  <div key={m.id} className="mt-2 flex gap-1">
                    <div className="w-4 h-4 bg-black rounded-sm"></div>
                    <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-pink-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-cyan-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="whitespace-nowrap">
                  <span className={clsx("font-bold", getColorClass(m.keyColor || keyColor))}>
                    {data.key}
                  </span>
                  <span className={clsx(getColorClass(separatorColor))}>{data.separator}</span>
                  <span className={clsx(getColorClass(m.outputColor || outputColor))}>
                    {data.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
