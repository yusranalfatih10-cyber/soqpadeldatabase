import { useState } from 'react';
import { checkStatus } from '../api';
import { STATUS_PENDAFTARAN, getPositionLabel, getStatusPemainLabel } from '../types';
import { Search, Loader, AlertCircle, FileText, Users } from 'lucide-react';

export default function StatusPage() {
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!nomorRegistrasi.trim()) {
      setError('Masukkan nomor registrasi');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await checkStatus(nomorRegistrasi.trim());
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || 'Nomor registrasi tidak ditemukan');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = result ? STATUS_PENDAFTARAN[result.status_pendaftaran as keyof typeof STATUS_PENDAFTARAN] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Cek Status Pendaftaran</h2>
        <p className="text-gray-600 mt-2">Masukkan nomor registrasi untuk melihat status pendaftaran Anda</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={nomorRegistrasi}
              onChange={(e) => { setNomorRegistrasi(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: SOQ-REG-2026-0001"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
            Cari
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Status Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nomor Registrasi</p>
                <p className="text-xl font-bold text-teal-800 font-mono">
                  {result.nomor_registrasi || result.nomorRegistrasi}
                </p>
              </div>
              <div>
                {statusInfo && (
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Team Info */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-teal-600" />
              Informasi Tim
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Nama Tim" value={result.nama_tim || result.namaTim} />
              <InfoRow label="Manajer" value={result.nama_manajer || result.namaManajer} />
              <InfoRow label="WhatsApp" value={result.nomor_whatsapp || result.nomorWhatsapp} />
              <InfoRow label="Asal Tim" value={result.asal_tim || result.asalTim} />
              <InfoRow label="Tanggal Daftar" value={result.tanggal_pendaftaran || result.tanggalPendaftaran} />
              {result.catatan_admin && <InfoRow label="Catatan Panitia" value={result.catatan_admin} />}
            </div>
          </div>

          {/* Players */}
          {result.players && result.players.length > 0 && (
            <div className="p-6 sm:p-8">
              <h4 className="font-bold text-gray-800 mb-4">
                Daftar Pemain ({result.players.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Nama</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 hidden sm:table-cell">JK</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Posisi</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.players.map((p: any, idx: number) => (
                      <tr key={p.player_registration_id || idx} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium text-gray-800">{p.nama_pemain}</td>
                        <td className="py-2 px-2 text-gray-600 hidden sm:table-cell">
                          {p.jenis_kelamin === 'PRIA' ? 'Pria' : 'Wanita'}
                        </td>
                        <td className="py-2 px-2 text-gray-600">{getPositionLabel(p.posisi)}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            (p.status_pemain as string) === 'UNGGULAN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getStatusPemainLabel(p.status_pemain)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}
