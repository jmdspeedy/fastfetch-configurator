
import React, { useState } from 'react';
import { useConfigStore, ModuleConfig } from '@/store/config';
import { X, Check } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface ModuleEditorProps {
    moduleId: string;
    onClose: () => void;
}

export default function ModuleEditor({ moduleId, onClose }: ModuleEditorProps) {
    const { modules, updateModule } = useConfigStore();
    const moduleData = modules.find((m) => m.id === moduleId);
    
    // Initialize state directly from found module
    // We rely on the parent component to supply a unique `key` (e.g. moduleId) 
    // to force a remount when switching modules, avoiding the need for useEffect sync.
    const [localConfig, setLocalConfig] = useState<ModuleConfig | null>(
        moduleData ? { ...moduleData } : null
    );

    if (!moduleData || !localConfig) return null;

    const handleSave = () => {
        if (localConfig) {
            updateModule(moduleId, localConfig);
        }
        onClose();
    };

    const handleChange = (field: keyof ModuleConfig, value: string | number | boolean) => {
        setLocalConfig((prev) => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        Edit <span className="text-blue-400 font-mono">{moduleData.type}</span> Module
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Common Field: Key (Label) */}
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Label (Key)</label>
                        <input
                            type="text"
                            value={localConfig.key || ''}
                            onChange={(e) => handleChange('key', e.target.value)}
                            placeholder={moduleData.type}
                            className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
                        />
                    </div>

                    {/* Specific Fields per Type */}
                    {moduleData.type === 'Command' && (
                        <div>
                            <label className="text-xs text-blue-400 mb-1 block font-bold">Shell Command</label>
                            <textarea
                                value={localConfig.text || ''}
                                onChange={(e) => handleChange('text', e.target.value)}
                                placeholder='echo "Hello World"'
                                className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono rounded-md p-2 h-24 focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Command to execute. Output will be displayed.
                            </p>
                        </div>
                    )}

                    {moduleData.type === 'File' && (
                        <div>
                            <label className="text-xs text-blue-400 mb-1 block font-bold">File Path</label>
                            <input
                                type="text"
                                value={localConfig.source || ''}
                                onChange={(e) => handleChange('source', e.target.value)}
                                placeholder="/path/to/file.txt"
                                className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono rounded-md p-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Absolute path to the file content to display.
                            </p>
                        </div>
                    )}

                    {(moduleData.type === 'Custom' || moduleData.type === 'Text') && (
                        <div>
                            <label className="text-xs text-blue-400 mb-1 block font-bold">Custom Text</label>
                            <textarea
                                value={localConfig.text || ''} // Using 'text' property for custom content as per schema often used or implied by 'format'
                                onChange={(e) => handleChange('text', e.target.value)}
                                placeholder="Static text content..."
                                className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-2 h-24 focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
                            />
                             <p className="text-[10px] text-gray-500 mt-1">Or use <code>format</code> property for advanced formatting.</p>
                        </div>
                    )}
                    
                     {/* Common Field: Format */}
                     <div>
                        <label className="text-xs text-gray-400 mb-1 block">Format String</label>
                        <input
                            type="text"
                            value={localConfig.format || ''}
                            onChange={(e) => handleChange('format', e.target.value)}
                            placeholder="{1} {2}"
                            className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono rounded-md p-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
                        />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                        <ColorPicker
                            label="Key Color"
                            value={localConfig.keyColor}
                            onChange={(val) => handleChange('keyColor', val)}
                        />
                        <ColorPicker
                            label="Output Color"
                            value={localConfig.outputColor}
                            onChange={(val) => handleChange('outputColor', val)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <Check size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
