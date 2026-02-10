'use client';

import { useConfigStore } from '@/store/config';
import { Download, RotateCcw, FileCode, Upload } from 'lucide-react';
import { useState } from 'react';
import TemplateModal from '@/components/modals/TemplateModal';
import ImportModal from '@/components/modals/ImportModal';
import DeployModal from '@/components/modals/DeployModal';

export default function HeaderControls() {
  const { resetConfig } = useConfigStore();
  // Using showDeployModal instead of showModal for clarity
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* Template Button */}
      <button
        onClick={() => setShowTemplateModal(true)}
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

      {/* Deploy Button */}
      <button
        onClick={() => setShowDeployModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
      >
        <Download size={18} />
        <span>Deploy Config</span>
      </button>

      <button onClick={() => confirm('Reset all settings?') && resetConfig()} className="p-2 text-gray-500 hover:text-red-400">
        <RotateCcw size={18} />
      </button>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <DeployModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
    </div>
  );
}
