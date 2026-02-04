import ModuleList from '@/components/ModuleList';
import JsonPreview from '@/components/JsonPreview';
import TerminalPreview from '@/components/TerminalPreview';
import AppearanceControls from '@/components/AppearanceControls';
import HeaderControls from '@/components/HeaderControls';
import { Settings } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-gray-200 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fastfetch Configurator</h1>
            <p className="text-gray-500 text-sm">Visual editor for fastfetch configuration files</p>
          </div>
        </div>
        
        <HeaderControls />
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
          
          {/* Modules Panel */}
          <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 shadow-lg flex-1 overflow-hidden flex flex-col min-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-white">Modules</h2>
            <div className="flex-1 overflow-hidden">
              <ModuleList />
            </div>
          </div>

          {/* Appearance Panel */}
          <div className="flex-1 min-h-[300px]">
            <AppearanceControls />
          </div>
        </div>

        {/* Center Column: Visual Preview */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <TerminalPreview />
        </div>

        {/* Right Column: Code Preview */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <JsonPreview />
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 border-t border-gray-800 pt-12 max-w-4xl mx-auto pb-12">
        <h2 className="text-xl font-bold mb-6 text-white text-center">Fastfetch Configuration FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400 text-sm">
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">What is a Fastfetch Configurator?</h3>
            <p>It is a visual tool that helps Linux users generate a <code>config.jsonc</code> file for Fastfetch. Instead of manually editing code in a terminal, you can use our interactive editor to customize your system fetch display with a real-time preview.</p>
          </div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">How do I change the Fastfetch logo?</h3>
            <p>Our generator includes a logo gallery with over 100 built-in distribution icons (Arch, Fedora, Ubuntu, etc.). You can also upload custom images which are converted into ASCII art optimized for your terminal size.</p>
          </div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">How do I install the generated config?</h3>
            <p>Simply click "Deploy Config" and run the generated one-line command in your terminal. It handles the <code>mkdir</code> and file placement for <code>~/.config/fastfetch/config.jsonc</code> automatically.</p>
          </div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">Fastfetch vs Neofetch?</h3>
            <p>Fastfetch is a modern, high-performance replacement for Neofetch, written in C. It is significantly faster and supports more modern protocols like Sixel and Kitty graphics for logos.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
