'use client';

import { useState } from 'react';
import Image from 'next/image';
import ModuleList from '@/components/ModuleList';
import TerminalPreview from '@/components/TerminalPreview';
import AppearanceControls from '@/components/AppearanceControls';
import HeaderControls from '@/components/HeaderControls';
import WelcomeScreen from '@/components/WelcomeScreen';
import FaqSection from '@/components/FaqSection';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleViewFaq = () => {
    setShowWelcome(false);
    requestAnimationFrame(() => {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} onViewFaq={handleViewFaq} />}

      <main id="editor" className="min-h-screen bg-[#111111] text-gray-200 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fastfetch Configurator</h1>
            <p className="text-gray-500 text-sm">Visual editor for fastfetch configuration files</p>
          </div>
        </div>

        <HeaderControls />
      </header>

      {/* Editor workspace: a flexible preview between independently scrollable control rails. */}
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:grid-cols-[minmax(250px,280px)_minmax(0,1fr)_minmax(220px,240px)] xl:gap-5 items-start">
        <section className="min-w-0 order-1 xl:order-none xl:col-start-2 xl:row-start-1 xl:sticky xl:top-6">
          <TerminalPreview />
        </section>

        {/* At laptop widths the rails share one column; at wide desktop they flank the preview. */}
        <div className="min-w-0 order-2 flex flex-col gap-4 lg:min-h-0 xl:contents">
          <aside className="min-w-0 xl:col-start-1 xl:row-start-1 xl:h-[calc(100vh-11rem)]">
            <AppearanceControls />
          </aside>

          <aside className="min-w-0 xl:col-start-3 xl:row-start-1 xl:h-[calc(100vh-11rem)]">
            <div className="bg-[#1e1e1e] p-3 rounded-lg border border-gray-800 shadow-lg overflow-hidden flex flex-col min-h-[300px] xl:h-full xl:min-h-0">
              <h2 className="text-sm font-semibold mb-3 text-white">Modules</h2>
              <div className="flex-1 min-h-0 overflow-hidden"><ModuleList /></div>
            </div>
          </aside>
        </div>
      </div>

      <FaqSection />
      </main>
    </>
  );
}
