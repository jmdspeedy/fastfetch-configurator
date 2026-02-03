'use client';

import { useConfigStore } from '@/store/config';
import { presetLogos } from '@/utils/logos';
import { convertImageToAscii } from '@/utils/ascii';
import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'black', 'default'];

export default function AppearanceControls() {
  const { logo, setPresetLogo, setCustomLogo, display, updateDisplay } = useConfigStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const ascii = await convertImageToAscii(file, 40); // 40 chars width
      setCustomLogo(ascii);
    } catch (err) {
      console.error('Failed to convert image', err);
      alert('Failed to convert image to ASCII');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 shadow-lg flex flex-col gap-6 h-full overflow-y-auto">
      
      {/* Logo Section */}
      <div>
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Logo</h2>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.keys(presetLogos).map(name => (
            <button
              key={name}
              onClick={() => setPresetLogo(name)}
              className={`p-2 text-xs font-mono capitalize rounded border ${
                logo._presetName === name && !logo._customContent
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-4">
          <label className="flex flex-col gap-2 cursor-pointer group">
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
              <ImageIcon size={14} /> Custom Image to ASCII
            </span>
            <div 
              className={`border-2 border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${
                isProcessing ? 'opacity-50' : 'hover:border-blue-500 hover:bg-gray-800/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={20} className="text-gray-500" />
              <span className="text-xs text-gray-500 text-center">
                {isProcessing ? 'Converting...' : 'Click to upload'}
              </span>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Colors</h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Key Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => updateDisplay({ color: { ...display.color, keys: c } })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    display.color?.keys === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c === 'default' ? '#555' : c === 'black' ? '#000' : c === 'magenta' ? '#d04497' : c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Separator</label>
            <input 
              type="text" 
              value={display.separator || ''}
              onChange={(e) => updateDisplay({ separator: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-md p-2 font-mono"
              placeholder=": "
            />
          </div>
        </div>
      </div>

    </div>
  );
}
