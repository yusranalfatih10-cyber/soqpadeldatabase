import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { LOGO_URL, CONFIG } from '../config';
import { CheckCircle, Copy, Home, Search } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { registrationResult, setTeamData, setPlayers } = useAppContext();
  const [copied, setCopied] = useState(false);

  if (!registrationResult) {
    navigate('/');
    return null;
  }

  const nomorRegistrasi = registrationResult.nomor_registrasi || registrationResult.nomorRegistrasi || '-';
  const namaTim = registrationResult.nama_tim || registrationResult.namaTim || '-';
  const jumlahPemain = registrationResult.jumlah_pemain || registrationResult.jumlahPemain || '-';
  const tanggal = registrationResult.tanggal_pendaftaran || registrationResult.tanggalPendaftaran || new Date().toLocaleDateString('id-ID');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(nomorRegistrasi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewRegistration = () => {
    setTeamData({
      nama_tim: '',
      nama_manajer: '',
      nomor_whatsapp: '',
      email_manajer: '',
      asal_tim: '',
    });
    setPlayers([]);
    navigate('/daftar');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-gray-600 mb-8">
          Data tim Anda telah berhasil dikirim dan disimpan.
        </p>

        {/* Registration Info */}
        <div className="bg-gradient-to-br from-teal-50 to-sky-50 rounded-2xl p-6 mb-8 border border-teal-100">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nomor Registrasi</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl sm:text-2xl font-bold text-teal-800 font-mono">
                  {nomorRegistrasi}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  title="Salin nomor registrasi"
                >
                  <Copy size={16} className={copied ? 'text-green-600' : 'text-gray-400'} />
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">Tersalin!</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-gray-500">Nama Tim</p>
                <p className="font-semibold text-gray-800">{namaTim}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Jumlah Pemain</p>
                <p className="font-semibold text-gray-800">{jumlahPemain} pemain</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tanggal Daftar</p>
                <p className="font-semibold text-gray-800">{tanggal}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-yellow-700">Menunggu Verifikasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-blue-800 font-medium mb-1">Langkah Selanjutnya:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Simpan nomor registrasi Anda untuk memantau status.</li>
            <li>• Panitia akan memverifikasi data pendaftaran Anda.</li>
            <li>• Anda akan diberitahu jika ada data yang perlu direvisi.</li>
            <li>• Gunakan menu "Cek Status" untuk melihat status terbaru.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/cek-status')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Search size={18} />
            CEK STATUS
          </button>
          <button
            onClick={handleNewRegistration}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home size={18} />
            DAFTAR TIM BARU
          </button>
        </div>
      </div>
    </div>
  );
}
