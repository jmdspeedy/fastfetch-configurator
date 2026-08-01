'use client';

import { useConfigStore } from '@/store/config';
import { generateConfigString } from '@/utils/configExport';
import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function JsonPreview({ onClose }: { onClose: () => void }) {
  const { modules, logo, display, general } = useConfigStore();
  const [copied, setCopied] = useState(false);

  const generateConfig = () => {
    return generateConfigString(modules, logo, display, general);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-3xl max-h-[85vh] bg-[#1e1e1e] text-gray-300 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500">config.jsonc</span>
        <div className="flex items-center gap-3">
          <button onClick={copyToClipboard} className="text-xs hover:text-white transition-colors flex items-center gap-1.5">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white" title="Close config viewer"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm custom-scrollbar">
        <pre>{generateConfig()}</pre>
      </div>
      </div>
    </div>
  );
}
