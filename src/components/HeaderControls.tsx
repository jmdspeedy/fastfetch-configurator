'use client';

import { useConfigStore } from '@/store/config';
import { Download, RotateCcw, FileText, Check } from 'lucide-react';
import { useState } from 'react';

export default function HeaderControls() {
  const { modules, logo, display, resetConfig } = useConfigStore();
  const [copied, setCopied] = useState(false);

  const generateConfigString = () => {
    const cleanModules = modules.map(({ id, ...rest }) => {
      if (Object.keys(rest).length === 1 && rest.type) return rest.type;
      return rest;
    });

    const config = {
      $schema: 'https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json',
      logo: { ...logo, _presetName: undefined, _customContent: undefined },
      display,
      modules: cleanModules,
    };

    return JSON.stringify(config, null, 2);
  };

  const handleDownloadConfig = () => {
    const json = generateConfigString();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.jsonc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLogo = () => {
    if (!logo._customContent) return;
    const blob = new Blob([logo._customContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logo.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset configuration to defaults?')) {
      resetConfig();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {logo._customContent && (
        <button
          onClick={handleDownloadLogo}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-green-400 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors border border-gray-700"
          title="Download Custom Logo ASCII file"
        >
          <FileText size={16} />
          <span className="hidden sm:inline">Download Logo</span>
        </button>
      )}

      <button
        onClick={handleDownloadConfig}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Download Config</span>
      </button>

      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-red-400 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors border border-gray-700"
        title="Reset to Defaults"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
