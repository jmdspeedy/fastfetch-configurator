'use client';

import { useConfigStore } from '@/store/config';
import { Download, RotateCcw, Check, ShieldCheck, Terminal, Copy, X } from 'lucide-react';
import { useState, useEffect, createElement } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': any;
    }
  }
}

export default function HeaderControls() {
  const { modules, logo, display, resetConfig } = useConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'captcha' | 'options' | 'result'>('captcha');
  const [installCommand, setInstallCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const generateConfigString = () => {
    const cleanModules = modules.map(({ id, ...rest }) => {
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

  useEffect(() => {
    const handleStateChange = (e: any) => {
      // Altcha emits 'verified' event when challenge is solved
      if (e.detail?.payload) {
        setAltchaPayload(e.detail.payload);
        setStep('options');
      }
    };

    window.addEventListener('verified', handleStateChange);
    window.addEventListener('statechange', handleStateChange);
    return () => {
      window.removeEventListener('verified', handleStateChange);
      window.removeEventListener('statechange', handleStateChange);
    };
  }, []);

  const handleQuickInstall = async () => {
    if (!altchaPayload) return;
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
        alert('Captcha verification failed. Please try again.');
        setStep('captcha');
        setAltchaPayload(null);
      }
    } catch (error) {
      console.error(error);
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
                  <p className="text-gray-400">Please complete the challenge to proceed.</p>
                  <div className="w-full flex justify-center min-h-[100px] text-black">
                    <altcha-widget
                      challenge-url="/api/config?type=challenge"
                      hidefooter
                      hidelogo
                    ></altcha-widget>
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
