import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONFIG } from '../config';
import {
  FileText, Database, FolderOpen, Code, Settings, CheckCircle2,
  Copy, ChevronDown, ChevronRight, AlertTriangle, ExternalLink,
  ArrowLeft, BookOpen, Server, Shield, Zap, Globe, Clipboard
} from 'lucide-react';

export default function DeployGuide() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (idx: number) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const sections = [
    {
      title: 'Persiapan Akun Google',
      icon: <Globe size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Pastikan Anda memiliki:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Akun Google (Gmail) yang aktif</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Akses ke Google Drive</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Akses ke Google Sheets</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Akses ke Google Apps Script</span>
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>💡 Tips:</strong> Gunakan akun Google yang sama untuk semua layanan agar memudahkan pengelolaan izin akses.
          </div>
        </div>
      ),
    },
    {
      title: 'Buat Google Spreadsheet (Database)',
      icon: <Database size={20} />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside text-gray-700">
            <li>
              Buka{' '}
              <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 underline inline-flex items-center gap-1">
                Google Sheets <ExternalLink size={12} />
              </a>
            </li>
            <li>Klik <strong>"+ Blank"</strong> untuk membuat spreadsheet baru</li>
            <li>
              Beri nama: <strong>"SOQ PADEL LEAGUE - Database"</strong>
            </li>
            <li>
              Salin <strong>Spreadsheet ID</strong> dari URL browser:
              <div className="mt-2 bg-gray-900 rounded-lg p-3 text-sm font-mono text-green-400 overflow-x-auto">
                https://docs.google.com/spreadsheets/d/<span className="text-yellow-300 font-bold">SPREADSHEET_ID_INI</span>/edit
              </div>
              <p className="text-xs text-gray-500 mt-1">Bagian yang ditandai kuning adalah Spreadsheet ID Anda</p>
            </li>
          </ol>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Penting: Bagikan Akses
            </p>
            <p className="text-sm text-amber-700">
              Spreadsheet akan otomatis bisa diakses oleh Apps Script karena dijalankan dengan akun Anda sendiri.
              Tidak perlu mengubah permission sharing.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Buat Folder Google Drive (Penyimpanan File)',
      icon: <FolderOpen size={20} />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside text-gray-700">
            <li>
              Buka{' '}
              <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 underline inline-flex items-center gap-1">
                Google Drive <ExternalLink size={12} />
              </a>
            </li>
            <li>Klik <strong>"+ New"</strong> → <strong>"New folder"</strong></li>
            <li>
              Beri nama folder: <strong>"SOQ PADEL LEAGUE"</strong>
            </li>
            <li>
              Salin <strong>Folder ID</strong> dari URL browser:
              <div className="mt-2 bg-gray-900 rounded-lg p-3 text-sm font-mono text-green-400 overflow-x-auto">
                https://drive.google.com/drive/folders/<span className="text-yellow-300 font-bold">FOLDER_ID_INI</span>
              </div>
            </li>
            <li>Di dalam folder tersebut, buat 3 sub-folder:</li>
          </ol>

          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
            <p className="text-gray-800 font-bold mb-1">📁 SOQ PADEL LEAGUE/</p>
            <p className="text-teal-700 ml-4">├── 📁 LOGO_TIM/</p>
            <p className="text-teal-700 ml-4">├── 📁 FOTO_PEMAIN/</p>
            <p className="text-teal-700 ml-4">└── 📁 DOKUMEN_PENDAFTARAN/</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>💡 Catatan:</strong> Sub-folder akan otomatis dibuat oleh Apps Script saat pertama kali upload file.
            Namun membuat manual lebih baik untuk memastikan struktur sudah benar.
          </div>
        </div>
      ),
    },
    {
      title: 'Deploy Google Apps Script (Backend)',
      icon: <Code size={20} />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li>
              Buka spreadsheet yang sudah dibuat, klik menu{' '}
              <strong>Extensions</strong> → <strong>Apps Script</strong>
            </li>
            <li>
              Hapus semua kode default di editor
            </li>
            <li>
              Salin seluruh kode backend dari file{' '}
              <a href="/google-apps-script/Code.gs" target="_blank" rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 underline inline-flex items-center gap-1">
                Code.gs <ExternalLink size={12} />
              </a>
              <p className="text-sm text-gray-500 mt-1">
                Atau klik tombol salin di bawah untuk menyalin kode:
              </p>
              <button
                onClick={() => copyToClipboard(GAS_CODE, 'full-code')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
              >
                {copiedCode === 'full-code' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copiedCode === 'full-code' ? 'Tersalin!' : 'Salin Seluruh Kode'}
              </button>
            </li>
            <li>
              Tempel (paste) kode ke editor Apps Script
            </li>
            <li>
              <strong>Ubah konfigurasi</strong> di bagian atas kode:
              <CodeBlock
                id="config"
                code={`const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
const DRIVE_FOLDER_ID = 'GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password_aman_anda';`}
                copiedCode={copiedCode}
                copyToClipboard={copyToClipboard}
              />
            </li>
            <li>
              Klik tombol <strong>Save</strong> (ikon disket) atau tekan <strong>Ctrl+S</strong>
            </li>
            <li>
              Jalankan fungsi <strong>setupSpreadsheet</strong>:
              <ul className="ml-6 mt-2 space-y-1 text-sm">
                <li>• Pilih fungsi <code className="bg-gray-100 px-1 rounded">setupSpreadsheet</code> di dropdown</li>
                <li>• Klik tombol <strong>Run</strong> (▶)</li>
                <li>• Berikan izin akses yang diminta (Authorize)</li>
                <li>• Tunggu sampai muncul log "Setup complete!"</li>
              </ul>
            </li>
            <li>
              <strong>Deploy sebagai Web App:</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm">
                <li>• Klik <strong>Deploy</strong> → <strong>New deployment</strong></li>
                <li>• Klik ikon ⚙️ → Pilih type: <strong>Web app</strong></li>
                <li>• Isi Description: <em>"SOQ Padel League API v1"</em></li>
                <li>• Execute as: <strong>Me (email Anda)</strong></li>
                <li>• Who has access: <strong>Anyone</strong></li>
                <li>• Klik <strong>Deploy</strong></li>
              </ul>
            </li>
            <li>
              <strong>Salin Web App URL</strong> yang diberikan:
              <div className="mt-2 bg-gray-900 rounded-lg p-3 text-sm font-mono text-green-400 overflow-x-auto">
                https://script.google.com/macros/s/<span className="text-yellow-300">DEPLOYMENT_ID</span>/exec
              </div>
            </li>
          </ol>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Perhatian
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Jika ada update kode, gunakan <strong>Manage deployments</strong> → edit → <strong>New version</strong> → Deploy</li>
              <li>• Jangan gunakan "Test deployments" karena URL-nya berbeda</li>
              <li>• Setiap kali deploy ulang, URL bisa berubah jika membuat deployment baru</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Konfigurasi Frontend Aplikasi',
      icon: <Settings size={20} />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside text-gray-700">
            <li>
              Buka file <code className="bg-gray-100 px-1.5 py-0.5 rounded">src/config.ts</code> di proyek frontend
            </li>
            <li>
              Ubah nilai <code className="bg-gray-100 px-1.5 py-0.5 rounded">GAS_URL</code> dengan URL Web App yang sudah disalin:
              <CodeBlock
                id="frontend-config"
                code={`export const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/DEPLOYMENT_ID_ANDA/exec',
  LOGO_URL: '${CONFIG.LOGO_URL}',
  // ... konfigurasi lainnya
};`}
                copiedCode={copiedCode}
                copyToClipboard={copyToClipboard}
              />
            </li>
            <li>
              Simpan file dan build ulang aplikasi:
              <CodeBlock
                id="build-cmd"
                code={`npm run build`}
                copiedCode={copiedCode}
                copyToClipboard={copyToClipboard}
              />
            </li>
            <li>
              Deploy folder <code className="bg-gray-100 px-1.5 py-0.5 rounded">dist/</code> ke hosting Anda
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Verifikasi Struktur Database',
      icon: <Database size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Setelah menjalankan <code className="bg-gray-100 px-1 rounded">setupSpreadsheet</code>,
            buka spreadsheet Anda dan pastikan sudah ada 3 sheet:
          </p>

          <div className="space-y-3">
            <SheetInfo
              name="REGISTRATIONS"
              description="Menyimpan data pendaftaran tim"
              columns={[
                'registration_id', 'nomor_registrasi', 'nama_tim', 'nama_manajer',
                'nomor_whatsapp', 'email_manajer', 'asal_tim', 'logo_file_id',
                'logo_file_url', 'status_pendaftaran', 'catatan_admin',
                'tanggal_pendaftaran', 'updated_at'
              ]}
            />
            <SheetInfo
              name="PLAYERS"
              description="Menyimpan data pemain individual"
              columns={[
                'player_registration_id', 'registration_id', 'nomor_registrasi',
                'nama_tim', 'nomor_urut_pemain', 'nama_pemain', 'jenis_kelamin',
                'posisi', 'status_pemain', 'photo_file_id', 'photo_file_url',
                'created_at', 'updated_at'
              ]}
            />
            <SheetInfo
              name="SETTINGS"
              description="Konfigurasi aplikasi"
              columns={['key', 'value']}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Testing & Pengujian',
      icon: <Zap size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Lakukan pengujian berikut untuk memastikan semua berfungsi:</p>

          <div className="space-y-3">
            <TestItem
              number="A"
              title="Pendaftaran Tim"
              steps={[
                'Isi seluruh data tim dengan lengkap',
                'Unggah logo tim',
                'Tambahkan minimal 2 pemain dengan foto',
                'Klik "Lanjut ke Pratinjau"',
                'Klik "Kirim Pendaftaran"',
                'Pastikan nomor registrasi muncul (format: SOQ-REG-2026-XXXX)',
                'Cek di Google Sheets apakah data tersimpan',
              ]}
            />
            <TestItem
              number="B"
              title="Cek Status"
              steps={[
                'Buka halaman "Cek Status Pendaftaran"',
                'Masukkan nomor registrasi yang sudah didapat',
                'Pastikan data tim dan pemain tampil',
                'Status awal harus "Menunggu Verifikasi"',
              ]}
            />
            <TestItem
              number="C"
              title="Dashboard Admin"
              steps={[
                'Buka halaman /admin',
                'Login dengan username dan password yang diatur',
                'Pastikan data pendaftaran muncul di tabel',
                'Buka detail pendaftaran',
                'Coba ubah status menjadi "Disetujui"',
                'Cek kembali di halaman "Cek Status" - status harus berubah',
              ]}
            />
            <TestItem
              number="D"
              title="File Upload"
              steps={[
                'Lakukan pendaftaran baru dengan logo dan foto pemain',
                'Buka folder Google Drive yang ditentukan',
                'Pastikan file logo ada di folder LOGO_TIM/',
                'Pastikan file foto ada di folder FOTO_PEMAIN/',
                'Pastikan URL foto bisa diakses di browser',
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Troubleshooting',
      icon: <AlertTriangle size={20} />,
      content: (
        <div className="space-y-4">
          <TroubleshootItem
            problem={'Error: "Script function not found"'}
            solution="Pastikan fungsi setupSpreadsheet sudah dijalankan. Buka Apps Script editor, pilih fungsi tersebut, dan klik Run."
          />
          <TroubleshootItem
            problem={'Error: "Tidak punya akses ke spreadsheet"'}
            solution="Pastikan SPREADSHEET_ID sudah benar. Buka spreadsheet dan salin ID dari URL. Pastikan Apps Script dijalankan dengan akun yang sama."
          />
          <TroubleshootItem
            problem={'Error: "Tidak punya akses ke Drive"'}
            solution="Pastikan FOLDER_ID sudah benar. Saat pertama kali deploy, Anda harus memberikan izin akses Drive."
          />
          <TroubleshootItem
            problem="CORS Error di frontend"
            solution="Pastikan Web App di-deploy dengan 'Who has access: Anyone'. Gunakan metode POST dengan Content-Type 'text/plain' (sudah di-handle di kode)."
          />
          <TroubleshootItem
            problem="File upload gagal"
            solution="Periksa ukuran file tidak melebihi batas (2MB). Pastikan folder Drive masih ada dan bisa diakses. Cek Execution Log di Apps Script."
          />
          <TroubleshootItem
            problem="Data tidak muncul di admin"
            solution="Pastikan token admin masih valid (8 jam). Coba login ulang. Periksa Execution Log di Apps Script untuk melihat error."
          />
          <TroubleshootItem
            problem="URL Web App berubah setelah update"
            solution="Gunakan 'Manage deployments' → edit deployment yang sama → buat versi baru. JANGAN buat deployment baru."
          />
          <TroubleshootItem
            problem="Foto pemain tidak tampil"
            solution="Pastikan file di Drive sharing permission-nya 'Anyone with link can view'. Cek photo_file_url di spreadsheet."
          />
        </div>
      ),
    },
    {
      title: 'Keamanan & Best Practices',
      icon: <Shield size={20} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <SecurityItem
              title="Password Admin"
              description="Gunakan password yang kuat (min 12 karakter, kombinasi huruf besar/kecil, angka, simbol). Jangan gunakan password default."
            />
            <SecurityItem
              title="Token Session"
              description="Token admin disimpan di Cache Service dengan durasi 8 jam. Setelah itu harus login ulang."
            />
            <SecurityItem
              title="File Access"
              description="File di Drive sharing-nya 'Anyone with link can view'. Jangan ubah menjadi 'public' untuk seluruh folder."
            />
            <SecurityItem
              title="Rate Limiting"
              description="Apps Script memiliki batas 20.000 request/hari (akun gratis). Untuk penggunaan lebih, pertimbangkan upgrade."
            />
            <SecurityItem
              title="Backup Data"
              description="Lakukan backup spreadsheet secara berkala. Gunakan fitur 'Make a copy' di Google Sheets."
            />
            <SecurityItem
              title="Lock Service"
              description="Kode sudah menggunakan LockService untuk mencegah race condition saat pendaftaran bersamaan."
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium mb-4">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Panduan Deploy Google Apps Script
          </h1>
        </div>
        <p className="text-gray-600">
          Panduan lengkap untuk menghubungkan aplikasi pendaftaran dengan Google Sheets & Google Drive
        </p>
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl p-5 border border-teal-100 mb-8">
        <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
          <Server size={18} /> Arsitektur Sistem
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-xl p-3 border border-teal-100">
            <p className="font-bold text-teal-700">Frontend</p>
            <p className="text-gray-600">React + Vite + Tailwind</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-teal-100">
            <p className="font-bold text-teal-700">Backend</p>
            <p className="text-gray-600">Google Apps Script</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-teal-100">
            <p className="font-bold text-teal-700">Database</p>
            <p className="text-gray-600">Google Sheets + Drive</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                  {section.icon}
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Langkah {idx + 1}</span>
                  <h3 className="font-bold text-gray-800">{section.title}</h3>
                </div>
              </div>
              {openSection === idx ? (
                <ChevronDown size={20} className="text-gray-400" />
              ) : (
                <ChevronRight size={20} className="text-gray-400" />
              )}
            </button>
            {openSection === idx && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Checklist */}
      <div className="mt-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
        <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} /> Checklist Akhir
        </h3>
        <div className="space-y-2">
          {[
            'Google Spreadsheet sudah dibuat dan diisi struktur sheet',
            'Folder Google Drive sudah dibuat dengan sub-folder',
            'Apps Script sudah di-deploy sebagai Web App',
            'GAS_URL di frontend sudah diisi URL deployment',
            'Fungsi setupSpreadsheet sudah dijalankan',
            'Pendaftaran uji berhasil dan data tersimpan',
            'File logo dan foto tersimpan di Drive',
            'Admin login berhasil',
            'Cek status berfungsi dengan benar',
            'Password admin sudah diganti dari default',
          ].map((item, idx) => (
            <label key={idx} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sub-components

function CodeBlock({ id, code, copiedCode, copyToClipboard }: {
  id: string;
  code: string;
  copiedCode: string | null;
  copyToClipboard: (text: string, id: string) => void;
}) {
  return (
    <div className="relative mt-2">
      <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
        title="Salin kode"
      >
        {copiedCode === id ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function SheetInfo({ name, description, columns }: { name: string; description: string; columns: string[] }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} className="text-teal-600" />
        <h4 className="font-bold text-gray-800">{name}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <div className="flex flex-wrap gap-1">
        {columns.map((col) => (
          <span key={col} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
            {col}
          </span>
        ))}
      </div>
    </div>
  );
}

function TestItem({ number, title, steps }: { number: string; title: string; steps: string[] }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-bold">
          {number}
        </span>
        <h4 className="font-bold text-gray-800">{title}</h4>
      </div>
      <ol className="ml-8 space-y-1 text-sm text-gray-700 list-decimal list-inside">
        {steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function TroubleshootItem({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/50">
      <p className="font-semibold text-orange-800 text-sm mb-1">❌ {problem}</p>
      <p className="text-sm text-gray-700">✅ {solution}</p>
    </div>
  );
}

function SecurityItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
      <Shield size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Full GAS Code for copy button
const GAS_CODE = [
  '/**',
  ' * SOQ.COMM PADEL LEAGUE - Google Apps Script Backend',
  ' * Deploy sebagai Web App dengan akses "Anyone"',
  ' */',
  '',
  "const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';",
  "const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID';",
  "const ADMIN_USERNAME = 'admin';",
  "const ADMIN_PASSWORD = 'your_password';",
  'const SESSION_DURATION_HOURS = 8;',
  '',
  'function doGet(e) {',
  '  const action = e.parameter.action;',
  '  let result;',
  '  try {',
  '    switch(action) {',
  "      case 'getSettings': result = handleGetSettings(); break;",
  "      case 'checkStatus': result = handleCheckStatus(e.parameter.nomor_registrasi); break;",
  "      case 'getRegistration': result = handleGetRegistration(e.parameter.registration_id); break;",
  "      case 'adminGetAll': result = handleAdminGetAll(e.parameter.token); break;",
  "      case 'adminExportCSV': result = handleAdminExportCSV(e.parameter.token); break;",
  "      default: result = { success: false, message: 'Action tidak valid' };",
  '    }',
  '  } catch(error) {',
  "    result = { success: false, message: 'Terjadi kesalahan server' };",
  '    Logger.log(error);',
  '  }',
  '  return ContentService.createTextOutput(JSON.stringify(result))',
  '    .setMimeType(ContentService.MimeType.JSON);',
  '}',
  '',
  '// Lihat file Code.gs lengkap untuk implementasi penuh',
  '',
  'function setupSpreadsheet() {',
  "  getSheet('REGISTRATIONS');",
  "  getSheet('PLAYERS');",
  "  getSheet('SETTINGS');",
  "  Logger.log('Setup complete!');",
  '}',
].join('\n');
