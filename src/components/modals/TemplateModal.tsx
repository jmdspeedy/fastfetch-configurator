'use client';

import { useConfigStore } from '@/store/config';
import { FileCode, Loader2, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
    const { loadConfig, resetConfig } = useConfigStore();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [templateError, setTemplateError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        setTemplateError(null);
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
            setTemplateError("Failed to load templates. Please try again.");
            console.error(err);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSelectTemplate = async (template: Template) => {
        setIsLoadingTemplates(true);
        setTemplateError(null);
        try {
            const response = await fetch(template.download_url);
            if (!response.ok) throw new Error('Failed to fetch template content');
            const text = await response.text();
            loadConfig(text);
            onClose();
        } catch (err) {
            setTemplateError(`Failed to load template ${template.name}.`);
            console.error(err);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    useEffect(() => {
        if (isOpen && templates.length === 0) {
            fetchTemplates();
        }
    }, [isOpen, templates.length]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileCode className="text-blue-500" size={20} />
                        Select Template
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchTemplates}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Refresh templates"
                        >
                            <RefreshCw size={16} className={isLoadingTemplates ? "animate-spin" : ""} />
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {templateError && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {templateError}
                        </div>
                    )}

                    {/* Empty/Reset Option */}
                    <button
                        onClick={() => {
                            resetConfig();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all text-left group"
                    >
                        <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                            <FileCode size={16} />
                        </div>
                        <div>
                            <div className="font-medium text-white text-sm">Empty / Default</div>
                            <div className="text-xs text-gray-500">Start with a blank configuration</div>
                        </div>
                    </button>

                    {isLoadingTemplates && templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <p className="text-sm">Loading templates...</p>
                        </div>
                    ) : (
                        <>
                            {/* Presets Section */}
                            {templates.filter(t => t.category === 'preset').length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 px-1 pt-2 pb-2">
                                        <div className="h-px flex-1 bg-gray-800" />
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Presets</span>
                                        <div className="h-px flex-1 bg-gray-800" />
                                    </div>
                                    <div className="space-y-2">
                                        {templates.filter(t => t.category === 'preset').map((template) => (
                                            <button
                                                key={template.name}
                                                onClick={() => handleSelectTemplate(template)}
                                                disabled={isLoadingTemplates}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                    <FileCode size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white text-sm">{template.name.replace(/\.jsonc?$/, '')}</div>
                                                    <div className="text-xs text-gray-500">Official preset</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Community Examples Section */}
                            {templates.filter(t => t.category === 'example').length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 px-1 pt-3 pb-2">
                                        <div className="h-px flex-1 bg-gray-800" />
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Community Examples</span>
                                        <div className="h-px flex-1 bg-gray-800" />
                                    </div>
                                    <div className="space-y-2">
                                        {templates.filter(t => t.category === 'example').map((template) => (
                                            <button
                                                key={template.name}
                                                onClick={() => handleSelectTemplate(template)}
                                                disabled={isLoadingTemplates}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-violet-500/50 hover:bg-gray-800/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors font-mono text-xs font-bold">
                                                    #{template.name.replace(/\.jsonc?$/, '')}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white text-sm">Example {template.name.replace(/\.jsonc?$/, '')}</div>
                                                    <div className="text-xs text-gray-500">Community example configuration</div>
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
        </div>
    );
}
