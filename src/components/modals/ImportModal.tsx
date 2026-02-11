'use client';

import { useConfigStore } from '@/store/config';
import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
    const { loadConfig } = useConfigStore();
    const [importContent, setImportContent] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = () => {
        try {
            if (!importContent.trim()) {
                setImportError("Please paste a valid JSON configuration or upload a file.");
                return;
            }
            loadConfig(importContent);
            setImportContent('');
            onClose();
        } catch {
            setImportError("Invalid JSON format. Please check your config.");
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setImportContent(content);
                setImportError(null);
            };
            reader.readAsText(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Upload className="text-violet-500" size={20} />
                        Import Configuration
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".json,.jsonc"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 bg-gray-800 border border-gray-700 border-dashed rounded-lg hover:bg-gray-750 hover:border-gray-500 transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Config File</span>
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <div className="absolute -top-3 left-3 bg-[#1e1e1e] px-2 text-xs text-gray-500">
                            OR PASTE JSON
                        </div>
                        <textarea
                            value={importContent}
                            onChange={(e) => {
                                setImportContent(e.target.value);
                                setImportError(null);
                            }}
                            placeholder="Paste your JSON configuration here..."
                            className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-violet-500 transition-colors resize-none custom-scrollbar"
                        />
                        {importError && (
                            <div className="absolute bottom-4 right-4 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                                {importError}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-gray-800 rounded-lg text-gray-400 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                        >
                            Import Config
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
