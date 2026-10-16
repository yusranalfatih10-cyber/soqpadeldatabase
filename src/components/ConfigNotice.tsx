import { useState } from 'react';
import { CONFIG } from '../config';
import { AlertTriangle, X, Settings } from 'lucide-react';

export default function ConfigNotice() {
  const [dismissed, setDismissed] = useState(false);
  
  const isDefaultConfig = CONFIG.GAS_URL.includes('YOUR_DEPLOYMENT_ID');
  
  if (!isDefaultConfig || dismissed) return null;
  
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <Settings size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800">Konfigurasi Backend Diperlukan</p>
            <p className="text-amber-700 mt-0.5">
              Aplikasi frontend siap digunakan. Untuk mengaktifkan penyimpanan data, 
              deploy Google Apps Script dan update <code className="bg-amber-100 px-1 rounded">CONFIG.GAS_URL</code> di <code className="bg-amber-100 px-1 rounded">src/config.ts</code>. 
              Lihat file <code className="bg-amber-100 px-1 rounded">public/google-apps-script/Code.gs</code> untuk kode backend.
            </p>
            <a
              href="#/panduan-deploy"
              className="text-sm text-amber-900 font-medium underline mt-1 inline-block hover:text-amber-700"
            >
              📖 Lihat Panduan Deploy Lengkap →
            </a>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-amber-100 text-amber-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
