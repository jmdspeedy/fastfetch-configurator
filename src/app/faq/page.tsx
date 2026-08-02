import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FaqSection from '@/components/FaqSection';

export const metadata: Metadata = {
  title: 'Fastfetch Configurator FAQ | Help & Documentation',
  description: 'Find answers about Fastfetch templates, logos, previews, configuration imports, and deployment.',
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] px-6 py-6 text-gray-200 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-gray-800 pb-6">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
            aria-label="Return to Fastfetch Configurator"
          >
            <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
            <div>
              <p className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-blue-300 motion-reduce:transition-none">
                Fastfetch Configurator
              </p>
              <p className="text-xs text-gray-500">Help &amp; documentation</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] motion-reduce:transition-none"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to configurator</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </header>

        <div className="mx-auto max-w-4xl pb-10 pt-14 sm:pt-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400/80">Help center</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Fastfetch Configurator FAQ</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
            Quick answers about building, previewing, importing, and installing a Fastfetch configuration.
          </p>
        </div>

        <FaqSection />
      </div>
    </main>
  );
}
