'use client';

import { useState } from 'react';
import { ArrowUpRight, CircleHelp, ChevronDown, ExternalLink } from 'lucide-react';

const inlineCodeClassName = 'rounded bg-black/50 px-1.5 py-0.5 font-mono text-[0.9em] text-blue-300';

const faqItems = [
  {
    question: 'What can I create with Fastfetch Configurator?',
    answer: (
      <p>
        Build and tune a Fastfetch <code className={inlineCodeClassName}>config.jsonc</code> file without hand-editing JSONC. Choose a template, arrange modules, customize the logo and colors, then inspect the generated file with <strong className="font-medium text-gray-200">View config</strong>. The preview includes representative Linux, macOS, and Windows profiles; use <strong className="font-medium text-gray-200">Load capture</strong> when you want host-specific values from your own machine.
      </p>
    ),
  },
  {
    question: 'Can I start from a template or import an existing config?',
    answer: (
      <p>
        Yes. On the welcome screen, choose <strong className="font-medium text-gray-200">Start from Template</strong> for an official preset or a clean configuration, or choose <strong className="font-medium text-gray-200">Import Config</strong> to upload or paste an existing file. The <strong className="font-medium text-gray-200">Templates</strong> and <strong className="font-medium text-gray-200">Import</strong> buttons remain available in the editor header if you want to switch approaches later.
      </p>
    ),
  },
  {
    question: 'How do I change the logo or customize my modules?',
    answer: (
      <p>
        Use the <strong className="font-medium text-gray-200">Appearance</strong> panel to choose a common logo, search the full library of more than 500 logos, or upload an image to convert it into terminal-friendly ASCII art. Use the <strong className="font-medium text-gray-200">Modules</strong> panel to add, remove, and drag modules into the order you want.
      </p>
    ),
  },
  {
    question: 'Should I deploy the config or download it?',
    answer: (
      <div className="space-y-3">
        <p>
          Choose <strong className="font-medium text-gray-200">Deploy Config</strong> to pass the security check and then select either <strong className="font-medium text-gray-200">One-Line Install</strong> or <strong className="font-medium text-gray-200">Download Files</strong>. The install option currently generates a Bash command that creates <code className={inlineCodeClassName}>~/.config/fastfetch</code> and writes the config there, plus a custom logo when one is used.
        </p>
        <p className="border-l-2 border-amber-400/60 pl-3 text-amber-200/80">
          Only run install commands you trust. Use <strong className="font-medium text-amber-100">Download Files</strong> if you prefer to review or place the files manually, or if you are not using a Bash-compatible shell.
        </p>
      </div>
    ),
  },
  {
    question: 'Why might the browser preview differ from my terminal?',
    answer: (
      <p>
        The browser starts with a representative system profile, so host-specific values and terminal-only features may not be available. Run Fastfetch on your machine with <code className={inlineCodeClassName}>--format json</code>, then use <strong className="font-medium text-gray-200">Load capture</strong> in the terminal preview to compare against real values. Some graphics protocols and terminal integrations can still vary by terminal emulator.
      </p>
    ),
  },
  {
    question: 'How is Fastfetch different from Neofetch?',
    answer: (
      <p>
        Fastfetch is a modern, performance-focused system information tool and a popular successor to Neofetch. This configurator focuses on building Fastfetch JSONC presets, with support for modern module options, terminal colors, and logo layouts.
      </p>
    ),
  },
] as const;

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="faq-title"
      className="mx-auto max-w-4xl pb-12"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#161616]/90 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 border-b border-gray-800 p-6 sm:flex-row sm:items-start sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10">
            <CircleHelp className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400/80">Need a hand?</p>
            <h2 id="faq-title" className="text-2xl font-bold tracking-tight text-white">Questions before you start</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Quick answers about templates, logos, previews, and getting your config into the terminal.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-800/80">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;

            return (
              <div key={item.question} className="group">
                <button
                  id={questionId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                  className={`flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/80 motion-reduce:transition-none sm:px-8 ${isOpen ? 'bg-gray-900/30' : ''}`}
                >
                  <span className="w-7 shrink-0 font-mono text-xs text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-sm font-semibold text-gray-200 sm:text-base">{item.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180 text-blue-400' : ''}`} aria-hidden="true" />
                </button>

                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className={`px-5 pb-6 pl-16 text-sm leading-7 text-gray-400 transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:px-8 sm:pb-7 sm:pl-[4.75rem] ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
                      <div className="max-w-3xl">{item.answer}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-800 bg-black/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold text-gray-200">Still stuck?</p>
            <p className="mt-1 text-xs text-gray-500">Find more Fastfetch details or let us know what is missing.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href="https://github.com/fastfetch-cli/fastfetch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] motion-reduce:transition-none"
            >
              Read Fastfetch docs
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/jmdspeedy/fastfetch-configurator/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 px-3 py-2 text-gray-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] motion-reduce:transition-none"
            >
              Report an issue
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
