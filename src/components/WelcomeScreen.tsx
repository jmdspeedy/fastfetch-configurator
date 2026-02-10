import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FileCode, Upload, CircleHelp, ArrowRight, Copy, Check, Loader2, RefreshCw, ChevronLeft, Monitor } from 'lucide-react';
import { useConfigStore } from '@/store/config';

interface WelcomeScreenProps {
    onComplete: () => void;
}

interface Template {
    name: string;
    download_url: string;
    category: 'preset' | 'example';
}

interface GitHubContentItem {
    name: string;
    download_url: string;
    type: string;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
    const [importMode, setImportMode] = useState(false);
    const [templateMode, setTemplateMode] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [configContent, setConfigContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loadConfig, resetConfig } = useConfigStore();

    /**
     * Detects if the viewport is below the desktop breakpoint (768px).
     * Listens for resize changes so the blocker appears/disappears dynamically.
     */
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        setIsMobile(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    /**
     * Fetches all presets from both the root `presets/` directory and the
     * `presets/examples/` subdirectory in parallel. Tags each template
     * with a category for grouped rendering.
     */
    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        setError(null);
        try {
            const [presetsRes, examplesRes] = await Promise.all([
                fetch('https://api.github.com/repos/fastfetch-cli/fastfetch/contents/presets?ref=dev'),
                fetch('https://api.github.com/repos/fastfetch-cli/fastfetch/contents/presets/examples?ref=dev'),
            ]);

            if (!presetsRes.ok || !examplesRes.ok) throw new Error('Failed to fetch templates');

            const [presetsData, examplesData]: [GitHubContentItem[], GitHubContentItem[]] = await Promise.all([
                presetsRes.json(),
                examplesRes.json(),
            ]);

            const isJsonFile = (item: GitHubContentItem) =>
                item.type === 'file' && (item.name.endsWith('.jsonc') || item.name.endsWith('.json'));

            const presetTemplates: Template[] = presetsData
                .filter(isJsonFile)
                .map((item) => ({ name: item.name, download_url: item.download_url, category: 'preset' as const }))
                .sort((a, b) => a.name.localeCompare(b.name));

            const exampleTemplates: Template[] = examplesData
                .filter(isJsonFile)
                .map((item) => ({ name: item.name, download_url: item.download_url, category: 'example' as const }))
                .sort((a, b) => {
                    const numA = parseInt(a.name);
                    const numB = parseInt(b.name);
                    return numA - numB;
                });

            setTemplates([...presetTemplates, ...exampleTemplates]);
        } catch (err) {
            setError("Failed to load templates. Please try again.");
            console.error(err);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Handle template mode activation
    const handleEnterTemplateMode = () => {
        setTemplateMode(true);
        fetchTemplates();
    };

    // Handle template selection
    const handleSelectTemplate = async (template: Template) => {
        setIsLoadingTemplates(true);
        setError(null);
        try {
            const response = await fetch(template.download_url);
            if (!response.ok) throw new Error('Failed to fetch template content');
            const text = await response.text();
            loadConfig(text);
            onComplete();
        } catch (err) {
            setError(`Failed to load template ${template.name}.`);
            console.error(err);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleStartEmpty = () => {
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
        } catch {
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

    /**
     * Mobile blocker screen — shown when the viewport is below 768px.
     * Prompts the user to switch to a desktop environment.
     */
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
                <div className="w-full max-w-md px-8 py-12 text-center">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
                        <Monitor className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-4">
                        Desktop Only
                    </h1>
                    <p className="text-gray-400 text-base leading-relaxed mb-6">
                        Fastfetch Configurator is designed for desktop environments. Please open this page on a device with a larger screen to use the editor.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Minimum width: 768px
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="w-full max-w-4xl p-8 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

                <div className="relative text-center mb-12">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 bg-black/20 backdrop-blur-sm">
                        <Image 
                            src="/logo.svg" 
                            alt="Fastfetch Configurator" 
                            width={64} 
                            height={64} 
                            className="w-16 h-16" 
                            priority
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Fastfetch Configurator
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Design your perfect terminal startup screen. Visual editor for generating modern, beautiful fastfetch configurations.
                    </p>
                </div>

                {!importMode && !templateMode ? (
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto relative">
                        {/* Option 1: Template */}
                        <button
                            onClick={handleEnterTemplateMode}
                            className="group relative flex flex-col items-start p-8 rounded-2xl bg-[#161616] border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all duration-300 text-left hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FileCode className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Start from Template</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Choose from official fastfetch presets or start with a clean configuration.
                            </p>
                            <div className="mt-auto flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                Browse templates <ArrowRight className="w-4 h-4 ml-2" />
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
                            <div className="mt-auto flex items-center text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                Import existing <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </div>
                ) : templateMode ? (
                    // Template Selection Mode
                    <div className="max-w-4xl mx-auto bg-[#161616] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col h-[500px]">
                         <div className="flex items-center justify-between mb-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setTemplateMode(false)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h3 className="text-xl font-semibold text-white">Select a Template</h3>
                            </div>
                            <button 
                                onClick={fetchTemplates}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Refresh templates"
                            >
                                <RefreshCw size={18} className={isLoadingTemplates ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm shrink-0">
                                {error}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-2 custom-scrollbar">
                             {/* Empty Start Option */}
                             <button
                                onClick={handleStartEmpty}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                    <FileCode size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Empty / Default</div>
                                    <div className="text-sm text-gray-500">Start with a basic blank configuration</div>
                                </div>
                            </button>

                            {isLoadingTemplates && templates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <p>Loading templates from GitHub...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Presets Section */}
                                    {templates.filter(t => t.category === 'preset').length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 px-1 pt-3 pb-2">
                                                <div className="h-px flex-1 bg-gray-800" />
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Presets</span>
                                                <div className="h-px flex-1 bg-gray-800" />
                                            </div>
                                            <div className="space-y-2">
                                                {templates.filter(t => t.category === 'preset').map((template) => (
                                                    <button
                                                        key={template.name}
                                                        onClick={() => handleSelectTemplate(template)}
                                                        disabled={isLoadingTemplates}
                                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                            <FileCode size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{template.name.replace(/\.jsonc?$/, '')}</div>
                                                            <div className="text-sm text-gray-500">Official preset</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Community Examples Section */}
                                    {templates.filter(t => t.category === 'example').length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 px-1 pt-4 pb-2">
                                                <div className="h-px flex-1 bg-gray-800" />
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Community Examples</span>
                                                <div className="h-px flex-1 bg-gray-800" />
                                            </div>
                                            <div className="space-y-2">
                                                {templates.filter(t => t.category === 'example').map((template) => (
                                                    <button
                                                        key={template.name}
                                                        onClick={() => handleSelectTemplate(template)}
                                                        disabled={isLoadingTemplates}
                                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-violet-500/50 hover:bg-[#1a1a1a] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                                                            <span className="font-mono text-xs font-bold">#{template.name.replace(/\.jsonc?$/, '')}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">Example {template.name.replace(/\.jsonc?$/, '')}</div>
                                                            <div className="text-sm text-gray-500">Community example configuration</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    // Import Mode
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
