'use client';

import { useConfigStore } from '@/store/config';
import { generateConfigString, downloadConfig } from '@/utils/configExport';
import { deployConfig } from '@/utils/deployApi';
import { Check, Copy, Download, ShieldCheck, Terminal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        turnstile: any;
    }
}

interface DeployModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DeployModal({ isOpen, onClose }: DeployModalProps) {
    const { modules, logo, display } = useConfigStore();
    const [step, setStep] = useState<'captcha' | 'options' | 'result'>('captcha');
    const [installCommand, setInstallCommand] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen && step === 'captcha' && turnstileRef.current && window.turnstile) {
            // If a widget already exists, remove it
            if (widgetId.current) {
                window.turnstile.remove(widgetId.current);
            }

            try {
                widgetId.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: '0x4AAAAAACXeni-B13oSbn93',
                    theme: 'dark',
                    callback: (token: string) => {
                        setAltchaPayload(token);
                        setStep('options');
                    },
                });
            } catch (e) {
                console.error("Turnstile render error:", e);
            }
        }

        // Cleanup when closing modal or component unmounts
        return () => {
            if (widgetId.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetId.current);
                } catch (e) {
                    console.error("Turnstile remove error:", e);
                }
                widgetId.current = null;
            }
        };
    }, [isOpen, step]);

    /** Resets modal state and calls the parent onClose callback. */
    const handleClose = () => {
        setStep('captcha');
        setAltchaPayload(null);
        setInstallCommand('');
        onClose();
    };

    const handleQuickInstall = async () => {
        if (!altchaPayload) {
            alert('Captcha token not available. Please try again.');
            setStep('captcha');
            return;
        }
        setLoading(true);

        // Generate config string
        const configStr = generateConfigString(modules, logo, display);
        const logoContent = logo._customContent;

        const result = await deployConfig(configStr, logoContent, altchaPayload);

        if (result.success && result.command) {
            setInstallCommand(result.command);
            setStep('result');
        } else {
            const errorMessage = result.error || 'Unknown error occurred.';
            if (result.status === 400 && errorMessage.includes('captcha')) {
                alert('Captcha verification failed or expired. Please complete the captcha again.');
            } else if (result.status === 503) {
                alert('Server is busy. Please try again in a moment.');
            } else {
                alert(`Error: ${errorMessage}`);
            }

            // Reset to captcha step to get a fresh token
            setStep('captcha');
            setAltchaPayload(null);
        }
        setLoading(false);
    };

    const handleDownload = () => {
        const json = generateConfigString(modules, logo, display);
        downloadConfig(json);
        handleClose();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {step === 'captcha' && <ShieldCheck className="text-blue-500" />}
                        {step === 'options' && <Download className="text-blue-500" />}
                        {step === 'result' && <Terminal className="text-green-500" />}
                        {step === 'captcha' ? 'Verification' : step === 'options' ? 'Choose Method' : 'Quick Install'}
                    </h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-white">
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
                                onClick={handleDownload}
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
                            <p className="text-sm text-gray-400">Copy and paste this command in your terminal.</p>
                            <div className="relative group">
                                <pre className="p-4 pr-12 bg-black rounded-lg border border-gray-800 text-green-500 font-mono text-xs max-h-24 overflow-hidden whitespace-pre-wrap break-all">
                                    {installCommand.length > 120
                                        ? installCommand.slice(0, 120) + '...'
                                        : installCommand}
                                </pre>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-md hover:bg-blue-600 transition-colors text-white"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Command is {installCommand.length.toLocaleString()} characters — click copy to get the full command.
                            </p>
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded text-amber-200 text-xs">
                                Warning: Only run commands you trust. This will overwrite ~/.config/fastfetch/config.jsonc.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
