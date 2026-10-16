import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { registerTeam } from '../api';
import { LOGO_URL, CONFIG } from '../config';
import { getPositionLabel, getStatusPemainLabel } from '../types';
import { ArrowLeft, Send, Edit, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState } from 'react';

export default function PreviewPage() {
  const navigate = useNavigate();
  const { teamData, players, setRegistrationResult } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no data
  if (!teamData.nama_tim && players.length === 0) {
    navigate('/daftar');
    return null;
  }

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const result = await registerTeam(teamData, players);
      
      if (result.success) {
        setRegistrationResult(result.data);
        navigate('/konfirmasi');
      } else {
        setError(result.message || 'Terjadi kesalahan saat mengirim pendaftaran. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Pratinjau Pendaftaran</h2>
        <p className="text-gray-600 mt-2">Periksa kembali data sebelum mengirim</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Gagal mengirim pendaftaran</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Team Data Preview */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-teal-800">Data Tim</h3>
          <button
            onClick={() => navigate('/daftar')}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-xl border-2 border-teal-200 overflow-hidden bg-teal-50">
              {teamData.logo_preview ? (
                <img src={teamData.logo_preview} alt="Logo Tim" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-400">
                  <span className="text-xs">Logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PreviewField label="Nama Tim" value={teamData.nama_tim} />
            <PreviewField label="Manajer" value={teamData.nama_manajer} />
            <PreviewField label="WhatsApp" value={teamData.nomor_whatsapp} />
            <PreviewField label="Email" value={teamData.email_manajer || '-'} />
            <PreviewField label="Asal Tim" value={teamData.asal_tim} />
          </div>
        </div>
      </div>

      {/* Players Preview */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-teal-800">
            Data Pemain ({players.length} pemain)
          </h3>
          <button
            onClick={() => navigate('/daftar')}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player, idx) => (
            <div key={player.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-sky-200 bg-sky-50 flex-shrink-0">
                  {player.photo_preview ? (
                    <img src={player.photo_preview} alt={player.nama_pemain} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sky-400 text-xs">Foto</div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600">Pemain {idx + 1}</span>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{player.nama_pemain}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600"><span className="font-medium">JK:</span> {player.jenis_kelamin === 'PRIA' ? 'Pria' : 'Wanita'}</p>
                <p className="text-gray-600"><span className="font-medium">Posisi:</span> {getPositionLabel(player.posisi)}</p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    (player.status_pemain as string) === 'UNGGULAN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusPemainLabel(player.status_pemain)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/daftar')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          KEMBALI KE FORMULIR
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader size={18} className="animate-spin" />
              MENGIRIM...
            </>
          ) : (
            <>
              <Send size={18} />
              KIRIM PENDAFTARAN
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
