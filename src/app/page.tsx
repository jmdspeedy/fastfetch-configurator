import ModuleList from '@/components/ModuleList';
import JsonPreview from '@/components/JsonPreview';
import TerminalPreview from '@/components/TerminalPreview';
import AppearanceControls from '@/components/AppearanceControls';
import { Settings } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-gray-200 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-800 pb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Settings className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fastfetch Configurator</h1>
          <p className="text-gray-500 text-sm">Visual editor for fastfetch configuration files</p>
        </div>
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
    </main>
  );
}
