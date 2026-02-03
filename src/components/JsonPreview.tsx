'use client';

import { useConfigStore, ModuleConfig } from '@/store/config';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function JsonPreview() {
  const { modules, logo, display } = useConfigStore();
  const [copied, setCopied] = useState(false);

  const generateConfig = () => {
    // 1. Clean modules (remove internal IDs)
    const cleanModules = modules.map(({ id, ...rest }) => {
      // If it only has 'type', return the string (shorthand)
      if (Object.keys(rest).length === 1 && rest.type) {
        return rest.type;
      }
      return rest;
    });

    // 2. Construct full object
    const config = {
      $schema: 'https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json',
      logo: { 
        ...logo,
        _presetName: undefined, // Remove internal flags
        _customContent: undefined 
      },
      display,
      modules: cleanModules,
    };

    return JSON.stringify(config, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500">config.jsonc</span>
        <button 
          onClick={copyToClipboard}
          className="text-xs hover:text-white transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <pre>{generateConfig()}</pre>
      </div>
    </div>
  );
}
