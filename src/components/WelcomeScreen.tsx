import React, { useState, useRef } from 'react';
import { FileCode, Upload, CircleHelp, ArrowRight, Copy, Check } from 'lucide-react';
import { useConfigStore } from '@/store/config';

interface WelcomeScreenProps {
    onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
    const [importMode, setImportMode] = useState(false);
    const [configContent, setConfigContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loadConfig, resetConfig } = useConfigStore();

    const handleStartTemplate = () => {
        resetConfig();
        onComplete();
    };

    const handleImport = () => {
        try {
            if (!configContent.trim()) {
                setError("Please paste a valid JSON configuration or upload a file.");
                return;
            }
            loadConfig(configContent);
            onComplete();
        } catch (e) {
            setError("Invalid JSON format. Please check your config.");
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setConfigContent(content);
                setError(null);
            };
            reader.readAsText(file);
        }
    };

    const handleCopyCommand = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        const configPath = "cat ~/.config/fastfetch/config.jsonc";
        navigator.clipboard.writeText(configPath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="w-full max-w-4xl p-8 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

                <div className="relative text-center mb-12">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                        <img src="/logo.svg" alt="Fastfetch Configurator" className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Fastfetch Configurator
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Design your perfect terminal startup screen. Visual editor for generating modern, beautiful fastfetch configurations.
                    </p>
                </div>

                {!importMode ? (
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto relative">
                        {/* Option 1: Template */}
                        <button
                            onClick={handleStartTemplate}
                            className="group relative flex flex-col items-start p-8 rounded-2xl bg-[#161616] border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all duration-300 text-left hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FileCode className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Start from Template</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Begin with a clean, standard configuration featuring popular modules. Perfect for new users or fresh starts.
                            </p>
                            <div className="mt-auto flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                Create new config <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </button>

                        {/* Option 2: Import */}
                        <div
                            onClick={() => setImportMode(true)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setImportMode(true); }}
                            role="button"
                            tabIndex={0}
                            className="group relative flex flex-col items-start p-8 rounded-2xl bg-[#161616] border border-gray-800 hover:border-violet-500/50 hover:bg-[#1a1a1a] transition-all duration-300 text-left hover:shadow-2xl hover:shadow-violet-500/10 cursor-pointer"
                        >
                            <div className="absolute top-6 right-6 group/tooltip" onClick={(e) => e.stopPropagation()}>
                                <CircleHelp className="w-5 h-5 text-gray-600 hover:text-gray-300 transition-colors cursor-help" />
                                <div className="absolute right-0 top-8 w-72 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 text-xs text-gray-300">
                                    <p className="font-semibold text-white mb-2">Your config location:</p>
                                    <div className="bg-black/50 p-2 rounded flex items-center justify-between gap-2 mb-2 font-mono border border-gray-700">
                                        <code className="text-[10px] break-all">
                                            cat ~/.config/fastfetch/config.jsonc
                                        </code>
                                        <button
                                            onClick={handleCopyCommand}
                                            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white shrink-0"
                                            title="Copy path"
                                        >
                                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <p>Upload your existing config file, or run <code className="bg-black/30 px-1 rounded">fastfetch --gen-config</code> to generate one first.</p>
                                </div>
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Import Config</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Already have a configuration? Upload your JSON config file or paste it to edit and visualize it in the editor.
                            </p>
                            <div className="mt-auto flex items-center text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                Import existing <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-[#161616] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white">Import Configuration</h3>
                        </div>

                        <div className="mb-6 flex gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".json,.jsonc"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-3 bg-gray-800 border border-gray-700 border-dashed rounded-xl hover:bg-gray-750 hover:border-gray-500 transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2 group"
                            >
                                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Upload Config File</span>
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute -top-3 left-3 bg-[#161616] px-2 text-xs text-gray-500">
                                OR PASTE JSON
                            </div>
                            <textarea
                                value={configContent}
                                onChange={(e) => {
                                    setConfigContent(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Paste your JSON configuration here..."
                                className="w-full h-48 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                            />
                            {error && (
                                <div className="absolute bottom-4 right-4 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setImportMode(false)}
                                className="px-4 py-2 hover:bg-gray-800 rounded-lg text-gray-400 text-sm transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                            >
                                Import Config
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
