'use client';

import { useConfigStore } from '@/store/config';
import { Download, RotateCcw, Check, ShieldCheck, Terminal, Copy, X, FileCode, Upload, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turnstile: any;
  }
}

interface Template {
  name: string;
  download_url: string;
}

interface GitHubContentItem {
  name: string;
  download_url: string;
  type: string;
}

export default function HeaderControls() {
  const { modules, logo, display, resetConfig, loadConfig } = useConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'captcha' | 'options' | 'result'>('captcha');
  const [installCommand, setInstallCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  
  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateConfigString = () => {
    const cleanModules = modules.map(({ id: _id, ...rest }) => {
      if (Object.keys(rest).length === 1 && rest.type) return rest.type;
      return rest;
    });

    const config = {
      $schema: 'https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json',
      logo: logo._customContent ? {
        type: 'file',
        source: '~/.config/fastfetch/logo.txt',
        padding: logo.padding
      } : {
        ...logo,
        _presetName: undefined,
        _customContent: undefined,
        source: logo.source || logo._presetName
      },
      display,
      modules: cleanModules,
    };

    return JSON.stringify(config, null, 2);
  };

  // Fetch templates from GitHub
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const response = await fetch('https://api.github.com/repos/fastfetch-cli/fastfetch/contents/presets/examples?ref=dev');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data: GitHubContentItem[] = await response.json();
      const validTemplates = data
        .filter((item) => item.name.endsWith('.jsonc') || item.name.endsWith('.json'))
        .map((item) => ({ name: item.name, download_url: item.download_url }));
      setTemplates(validTemplates);
    } catch (err) {
      setTemplateError("Failed to load templates. Please try again.");
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Handle template selection
  const handleSelectTemplate = async (template: Template) => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const response = await fetch(template.download_url);
      if (!response.ok) throw new Error('Failed to fetch template content');
      const text = await response.text();
      loadConfig(text);
      setShowTemplateModal(false);
    } catch (err) {
      setTemplateError(`Failed to load template ${template.name}.`);
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Handle import
  const handleImport = () => {
    try {
      if (!importContent.trim()) {
        setImportError("Please paste a valid JSON configuration or upload a file.");
        return;
      }
      loadConfig(importContent);
      setShowImportModal(false);
      setImportContent('');
    } catch {
      setImportError("Invalid JSON format. Please check your config.");
    }
  };

  // Handle file upload
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

  useEffect(() => {
    if (showModal && step === 'captcha' && turnstileRef.current && window.turnstile) {
      if (widgetId.current) {
        window.turnstile.remove(widgetId.current);
      }
      
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: '0x4AAAAAACXeni-B13oSbn93',
        theme: 'dark',
        callback: (token: string) => {
          setAltchaPayload(token);
          setStep('options');
        },
      });
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [showModal, step]);

  const handleQuickInstall = async () => {
    if (!altchaPayload) {
      alert('Captcha token not available. Please try again.');
      setStep('captcha');
      return;
    }
    setLoading(true);
    try {
      const configStr = generateConfigString();
      const logoContent = logo._customContent;

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: configStr,
          logo: logoContent,
          altchaPayload: altchaPayload
        })
      });

      if (response.ok) {
        const { id } = await response.json();
        const baseUrl = window.location.origin;
        setInstallCommand(`curl -sSL "${baseUrl}/api/config?id=${id}&type=install" | bash`);
        setStep('result');
      } else {
        // Parse error response for better feedback
        let errorMessage = 'Failed to generate install command.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Response might not be JSON
        }
        
        if (response.status === 400 && errorMessage.includes('captcha')) {
          alert('Captcha verification failed or expired. Please complete the captcha again.');
        } else if (response.status === 503) {
          alert('Server is busy. Please try again in a moment.');
        } else {
          alert(`Error: ${errorMessage}`);
        }
        
        // Reset to captcha step to get a fresh token
        setStep('captcha');
        setAltchaPayload(null);
      }
    } catch (error) {
      console.error('Install command generation error:', error);
      alert('Network error. Please check your connection and try again.');
      setStep('captcha');
      setAltchaPayload(null);
    }
    setLoading(false);
  };

  const handleDownloadConfig = () => {
    const json = generateConfigString();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.jsonc';
    a.click();
    setShowModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Template Button */}
      <button
        onClick={() => {
          setShowTemplateModal(true);
          fetchTemplates();
        }}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md hover:bg-gray-700 hover:border-gray-600 transition-all"
        title="Load Template"
      >
        <FileCode size={16} />
        <span className="hidden sm:inline">Templates</span>
      </button>

      {/* Import Button */}
      <button
        onClick={() => setShowImportModal(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md hover:bg-gray-700 hover:border-gray-600 transition-all"
        title="Import Config"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Import</span>
      </button>

      <button
        onClick={() => { 
          setShowModal(true); 
          setStep('captcha'); 
          setAltchaPayload(null);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
      >
        <Download size={18} />
        <span>Deploy Config</span>
      </button>

      <button onClick={() => confirm('Reset all settings?') && resetConfig()} className="p-2 text-gray-500 hover:text-red-400">
        <RotateCcw size={18} />
      </button>

      {/* Template Selection Modal */}
      {showTemplateModal && (
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
                <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-white">
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
                  setShowTemplateModal(false);
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
                templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={isLoadingTemplates}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors font-mono text-xs font-bold">
                      {template.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500">Official fastfetch preset</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Config Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="text-violet-500" size={20} />
                Import Configuration
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-white">
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
                  className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
                {importError && (
                  <div className="absolute bottom-4 right-4 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                    {importError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
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
      )}

      {/* Deploy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {step === 'captcha' && <ShieldCheck className="text-blue-500" />}
                {step === 'options' && <Download className="text-blue-500" />}
                {step === 'result' && <Terminal className="text-green-500" />}
                {step === 'captcha' ? 'Verification' : step === 'options' ? 'Choose Method' : 'Quick Install'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {step === 'captcha' && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <p className="text-gray-400">Security Check</p>
                  <div className="w-full flex justify-center min-h-[65px]" ref={turnstileRef}>
                    {/* Turnstile widget renders here */}
                  </div>
                </div>
              )}

              {step === 'options' && (
                <div className="grid gap-4">
                  <button 
                    onClick={handleQuickInstall}
                    disabled={loading}
                    className="flex flex-col items-start gap-1 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg hover:bg-blue-600/20 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                      <Terminal size={18} /> One-Line Install
                    </div>
                    <p className="text-sm text-gray-400">Perfect for quick terminal setup.</p>
                  </button>

                  <button 
                    onClick={handleDownloadConfig}
                    className="flex flex-col items-start gap-1 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Download size={18} /> Download Files
                    </div>
                    <p className="text-sm text-gray-400">Get the config.jsonc file directly.</p>
                  </button>
                </div>
              )}

              {step === 'result' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">Run this command in your terminal. Valid for 5 minutes.</p>
                  <div className="relative group">
                    <pre className="p-4 bg-black rounded-lg border border-gray-800 text-green-500 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {installCommand}
                    </pre>
                    <button 
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-800 rounded-md hover:bg-blue-600 transition-colors text-white"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded text-amber-200 text-xs">
                    Warning: Only run commands you trust. This will overwrite ~/.config/fastfetch/config.jsonc.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

