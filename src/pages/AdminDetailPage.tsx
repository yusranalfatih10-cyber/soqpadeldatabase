import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { getRegistration, adminUpdateStatus, adminUpdatePlayer, adminAddPlayer, adminDeletePlayer, adminDeleteRegistration, uploadFile } from '../api';
import { STATUS_PENDAFTARAN, POSISI_OPTIONS, JENIS_KELAMIN_OPTIONS, STATUS_PEMAIN_OPTIONS, getPositionLabel, getStatusPemainLabel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Edit, Save,
  Trash2, Plus, Camera, User, Loader, AlertCircle, Send, ChevronDown
} from 'lucide-react';

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adminToken } = useAppContext();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState<any>({
    nama_pemain: '', jenis_kelamin: '', posisi: '', status_pemain: '',
    photo_file: null, photo_preview: '',
  });

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    loadDetail();
  }, [id, adminToken]);

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getRegistration(id);
      if (result.success && result.data) {
        setRegistration(result.data);
      } else {
        setError('Data pendaftaran tidak ditemukan');
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!adminToken || !id) return;
    
    if ((status === 'PERLU_REVISI' || status === 'DITOLAK') && !catatanRevisi.trim()) {
      setError('Catatan wajib diisi untuk status Perlu Revisi atau Ditolak');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await adminUpdateStatus(adminToken, id, status, catatanRevisi);
      if (result.success) {
        setSuccess('Status berhasil diperbarui');
        setCatatanRevisi('');
        loadDetail();
      } else {
        setError(result.message || 'Gagal memperbarui status');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlayerEdit = async (playerRegId: string) => {
    if (!adminToken) return;
    setSaving(true);
    setError('');

    try {
      // Upload new photo if changed
      let photoFileId = editData.photo_file_id;
      let photoFileUrl = editData.photo_file_url;
      
      if (editData.photo_file) {
        const uploadResult = await uploadFile(editData.photo_file, 'foto_pemain');
        if (uploadResult.success) {
          photoFileId = uploadResult.data?.fileId || '';
          photoFileUrl = uploadResult.data?.fileUrl || '';
        }
      }

      const result = await adminUpdatePlayer(adminToken, playerRegId, {
        nama_pemain: editData.nama_pemain,
        jenis_kelamin: editData.jenis_kelamin,
        posisi: editData.posisi,
        status_pemain: editData.status_pemain,
        photo_file_id: photoFileId,
        photo_file_url: photoFileUrl,
      });

      if (result.success) {
        setSuccess('Data pemain berhasil diperbarui');
        setEditingPlayer(null);
        loadDetail();
      } else {
        setError(result.message || 'Gagal memperbarui data pemain');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!adminToken || !id) return;
    if (!newPlayer.nama_pemain.trim() || !newPlayer.jenis_kelamin || !newPlayer.posisi || !newPlayer.status_pemain) {
      setError('Lengkapi semua data pemain');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let photoFileId = '';
      let photoFileUrl = '';
      
      if (newPlayer.photo_file) {
        const uploadResult = await uploadFile(newPlayer.photo_file, 'foto_pemain');
        if (uploadResult.success) {
          photoFileId = uploadResult.data?.fileId || '';
          photoFileUrl = uploadResult.data?.fileUrl || '';
        }
      }

      const result = await adminAddPlayer(adminToken, id, {
        nama_pemain: newPlayer.nama_pemain,
        jenis_kelamin: newPlayer.jenis_kelamin,
        posisi: newPlayer.posisi,
        status_pemain: newPlayer.status_pemain,
        photo_file_id: photoFileId,
        photo_file_url: photoFileUrl,
      });

      if (result.success) {
        setSuccess('Pemain berhasil ditambahkan');
        setShowAddPlayer(false);
        setNewPlayer({ nama_pemain: '', jenis_kelamin: '', posisi: '', status_pemain: '', photo_file: null, photo_preview: '' });
        loadDetail();
      } else {
        setError(result.message || 'Gagal menambahkan pemain');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (playerRegId: string) => {
    if (!adminToken) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus pemain ini?')) return;

    setSaving(true);
    setError('');

    try {
      const result = await adminDeletePlayer(adminToken, playerRegId);
      if (result.success) {
        setSuccess('Pemain berhasil dihapus');
        loadDetail();
      } else {
        setError(result.message || 'Gagal menghapus pemain');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!adminToken || !id) return;
    if (!window.confirm('PERINGATAN: Ini akan menghapus seluruh pendaftaran termasuk semua pemain. Lanjutkan?')) return;

    setSaving(true);
    try {
      const result = await adminDeleteRegistration(adminToken, id);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Gagal menghapus pendaftaran');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const startEditPlayer = (player: any) => {
    setEditingPlayer(player.player_registration_id);
    setEditData({
      nama_pemain: player.nama_pemain,
      jenis_kelamin: player.jenis_kelamin,
      posisi: player.posisi,
      status_pemain: player.status_pemain,
      photo_file_id: player.photo_file_id,
      photo_file_url: player.photo_file_url,
      photo_preview: player.photo_preview || '',
      photo_file: null,
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader size={32} className="animate-spin text-teal-500 mx-auto mb-3" />
        <p className="text-gray-600">Memuat data pendaftaran...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-4">{error || 'Data tidak ditemukan'}</p>
        <button onClick={() => navigate('/admin/dashboard')} className="px-4 py-2 bg-teal-500 text-white rounded-xl">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_PENDAFTARAN[registration.status_pendaftaran as keyof typeof STATUS_PENDAFTARAN];
  const players = registration.players || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Detail Pendaftaran</h2>
            <p className="text-sm text-teal-600 font-mono">{registration.nomor_registrasi || registration.nomorRegistrasi}</p>
          </div>
        </div>
        {statusInfo && (
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Team Data */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Data Tim</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-xl border-2 border-teal-200 overflow-hidden bg-teal-50 flex-shrink-0">
            {registration.logo_file_url ? (
              <img src={registration.logo_file_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-400 text-xs">Logo</div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Nama Tim" value={registration.nama_tim || registration.namaTim} />
            <DetailField label="Manajer" value={registration.nama_manajer || registration.namaManajer} />
            <DetailField label="WhatsApp" value={registration.nomor_whatsapp || registration.nomorWhatsapp} />
            <DetailField label="Email" value={registration.email_manajer || registration.emailManajer || '-'} />
            <DetailField label="Asal Tim" value={registration.asal_tim || registration.asalTim} />
            <DetailField label="Tanggal Daftar" value={registration.tanggal_pendaftaran || registration.tanggalPendaftaran} />
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            Pemain ({players.length})
          </h3>
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors"
          >
            <Plus size={16} /> Tambah Pemain
          </button>
        </div>

        {/* Add Player Form */}
        {showAddPlayer && (
          <div className="mb-6 p-4 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/50">
            <h4 className="font-bold text-teal-800 mb-3">Tambah Pemain Baru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newPlayer.nama_pemain}
                onChange={(e) => setNewPlayer({ ...newPlayer, nama_pemain: e.target.value })}
                placeholder="Nama lengkap"
                className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 outline-none"
              />
              <select
                value={newPlayer.jenis_kelamin}
                onChange={(e) => setNewPlayer({ ...newPlayer, jenis_kelamin: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none appearance-none bg-white"
              >
                <option value="">Jenis Kelamin</option>
                {JENIS_KELAMIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={newPlayer.posisi}
                onChange={(e) => setNewPlayer({ ...newPlayer, posisi: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none appearance-none bg-white"
              >
                <option value="">Posisi</option>
                {POSISI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                {STATUS_PEMAIN_OPTIONS.map(o => (
                  <label key={o.value} className={`px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                    newPlayer.status_pemain === o.value ? 'border-teal-400 bg-teal-50' : 'border-gray-200'
                  }`}>
                    <input type="radio" name="new_player_status" value={o.value}
                      checked={newPlayer.status_pemain === o.value}
                      onChange={(e) => setNewPlayer({ ...newPlayer, status_pemain: e.target.value })}
                      className="sr-only" />
                    {o.label}
                  </label>
                ))}
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button onClick={handleAddPlayer} disabled={saving}
                  className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Pemain'}
                </button>
                <button onClick={() => setShowAddPlayer(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Cards */}
        <div className="space-y-4">
          {players.map((player: any, idx: number) => (
            <div key={player.player_registration_id || idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              {editingPlayer === player.player_registration_id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-sky-200 bg-sky-50 flex-shrink-0">
                      {editData.photo_preview ? (
                        <img src={editData.photo_preview} alt="" className="w-full h-full object-cover" />
                      ) : player.photo_file_url ? (
                        <img src={player.photo_file_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="w-full h-full flex items-center justify-center text-sky-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={editData.nama_pemain}
                      onChange={(e) => setEditData({ ...editData, nama_pemain: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select value={editData.jenis_kelamin}
                      onChange={(e) => setEditData({ ...editData, jenis_kelamin: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                      {JENIS_KELAMIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={editData.posisi}
                      onChange={(e) => setEditData({ ...editData, posisi: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                      {POSISI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={editData.status_pemain}
                      onChange={(e) => setEditData({ ...editData, status_pemain: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                      {STATUS_PEMAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSavePlayerEdit(player.player_registration_id)} disabled={saving}
                      className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                      <Save size={12} /> Simpan
                    </button>
                    <button onClick={() => setEditingPlayer(null)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-sky-200 bg-sky-50 flex-shrink-0">
                      {player.photo_file_url ? (
                        <img src={player.photo_file_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="w-full h-full flex items-center justify-center text-sky-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{player.nama_pemain}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-gray-500">{player.jenis_kelamin === 'PRIA' ? 'Pria' : 'Wanita'}</span>
                        <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">{getPositionLabel(player.posisi)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          (player.status_pemain as string) === 'UNGGULAN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getStatusPemainLabel(player.status_pemain)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditPlayer(player)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeletePlayer(player.player_registration_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Verifikasi Pendaftaran</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan Panitia</label>
          <textarea
            value={catatanRevisi}
            onChange={(e) => setCatatanRevisi(e.target.value)}
            placeholder="Catatan untuk tim (wajib jika meminta revisi atau menolak)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleStatusUpdate('DISETUJUI')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">
            <CheckCircle size={16} /> Setujui
          </button>
          <button onClick={() => handleStatusUpdate('PERLU_REVISI')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
            <AlertTriangle size={16} /> Minta Revisi
          </button>
          <button onClick={() => handleStatusUpdate('DITOLAK')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 transition-colors">
            <XCircle size={16} /> Tolak
          </button>
          <button onClick={() => handleStatusUpdate('MENUNGGU_VERIFIKASI')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors">
            <Clock size={16} /> Kembalikan ke Menunggu
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-md border border-red-100 p-6">
        <h3 className="text-lg font-bold text-red-700 mb-3">Zona Berbahaya</h3>
        <p className="text-sm text-gray-600 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
        <button onClick={handleDeleteRegistration} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50 transition-colors">
          <Trash2 size={16} /> Hapus Pendaftaran
        </button>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}
