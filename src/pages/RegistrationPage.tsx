import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { CONFIG } from '../config';
import { v4 as uuidv4 } from 'uuid';
import type { PlayerData } from '../types';
import { POSISI_OPTIONS, JENIS_KELAMIN_OPTIONS, STATUS_PEMAIN_OPTIONS } from '../types';
import { Plus, Trash2, Camera, User, ChevronDown, AlertCircle, Check } from 'lucide-react';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { teamData, setTeamData, players, setPlayers } = useAppContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Team form handlers
  const handleTeamChange = (field: string, value: string) => {
    setTeamData({ ...teamData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, logo: 'Format file harus JPG, PNG, atau WebP' });
      return;
    }
    if (file.size > CONFIG.MAX_LOGO_SIZE) {
      setErrors({ ...errors, logo: 'Ukuran file maksimal 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTeamData({
        ...teamData,
        logo_file: file,
        logo_preview: reader.result as string,
      });
      setErrors({ ...errors, logo: '' });
    };
    reader.readAsDataURL(file);
  };

  // Player management
  const addPlayer = () => {
    if (players.length >= CONFIG.MAX_PLAYERS) {
      setErrors({ ...errors, players: `Maksimal ${CONFIG.MAX_PLAYERS} pemain` });
      return;
    }
    const newPlayer: PlayerData = {
      id: uuidv4(),
      nama_pemain: '',
      jenis_kelamin: '',
      posisi: '',
      status_pemain: '',
      photo_file: null,
      photo_preview: '',
    };
    setPlayers([...players, newPlayer]);
    setErrors({ ...errors, players: '' });
  };

  const removePlayer = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pemain ini?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayer = (id: string, field: string, value: any) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handlePlayerPhoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, [`photo_${id}`]: 'Format file harus JPG, PNG, atau WebP' });
      return;
    }
    if (file.size > CONFIG.MAX_PHOTO_SIZE) {
      setErrors({ ...errors, [`photo_${id}`]: 'Ukuran file maksimal 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updatePlayer(id, 'photo_file', file);
      updatePlayer(id, 'photo_preview', reader.result as string);
      setErrors({ ...errors, [`photo_${id}`]: '' });
    };
    reader.readAsDataURL(file);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!teamData.nama_tim.trim()) newErrors.nama_tim = 'Nama tim wajib diisi';
    if (!teamData.nama_manajer.trim()) newErrors.nama_manajer = 'Nama manajer wajib diisi';
    if (!teamData.nomor_whatsapp.trim()) {
      newErrors.nomor_whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^[0-9+\-\s]{8,20}$/.test(teamData.nomor_whatsapp.trim())) {
      newErrors.nomor_whatsapp = 'Format nomor WhatsApp tidak valid';
    }
    if (teamData.email_manajer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamData.email_manajer)) {
      newErrors.email_manajer = 'Format email tidak valid';
    }
    if (!teamData.asal_tim.trim()) newErrors.asal_tim = 'Asal tim wajib diisi';

    if (players.length < CONFIG.MIN_PLAYERS) {
      newErrors.players = `Minimal ${CONFIG.MIN_PLAYERS} pemain harus didaftarkan`;
    }

    players.forEach((p, idx) => {
      if (!p.nama_pemain.trim()) newErrors[`player_name_${idx}`] = 'Nama pemain wajib diisi';
      if (!p.jenis_kelamin) newErrors[`player_gender_${idx}`] = 'Pilih jenis kelamin';
      if (!p.posisi) newErrors[`player_position_${idx}`] = 'Pilih posisi bermain';
      if (!p.status_pemain) newErrors[`player_status_${idx}`] = 'Pilih status pemain';
    });

    // Check duplicate player names
    const names = players.map(p => p.nama_pemain.trim().toLowerCase()).filter(n => n);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    if (duplicates.length > 0) {
      newErrors.players = 'Terdapat nama pemain yang sama dalam satu tim';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      navigate('/pratinjau');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Formulir Pendaftaran</h2>
        <p className="text-gray-600 mt-2">Lengkapi data tim dan pemain Anda</p>
      </div>

      {/* Team Data Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
        <h3 className="text-xl font-bold text-teal-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">1</span>
          Data Tim
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Tim */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nama Tim/Klub <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamData.nama_tim}
              onChange={(e) => handleTeamChange('nama_tim', e.target.value)}
              placeholder="Masukkan nama tim atau klub"
              className={`w-full px-4 py-3 rounded-xl border ${errors.nama_tim ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
            />
            {errors.nama_tim && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.nama_tim}</p>}
          </div>

          {/* Nama Manajer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nama Manajer Tim <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamData.nama_manajer}
              onChange={(e) => handleTeamChange('nama_manajer', e.target.value)}
              placeholder="Nama lengkap manajer"
              className={`w-full px-4 py-3 rounded-xl border ${errors.nama_manajer ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
            />
            {errors.nama_manajer && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.nama_manajer}</p>}
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={teamData.nomor_whatsapp}
              onChange={(e) => handleTeamChange('nomor_whatsapp', e.target.value)}
              placeholder="08xxxxxxxxxx"
              className={`w-full px-4 py-3 rounded-xl border ${errors.nomor_whatsapp ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
            />
            {errors.nomor_whatsapp && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.nomor_whatsapp}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Manajer
            </label>
            <input
              type="email"
              value={teamData.email_manajer}
              onChange={(e) => handleTeamChange('email_manajer', e.target.value)}
              placeholder="email@contoh.com (opsional)"
              className={`w-full px-4 py-3 rounded-xl border ${errors.email_manajer ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
            />
            {errors.email_manajer && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.email_manajer}</p>}
          </div>

          {/* Asal Tim */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kota/Kabupaten Asal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamData.asal_tim}
              onChange={(e) => handleTeamChange('asal_tim', e.target.value)}
              placeholder="Kota Sorong, Kabupaten Sorong, dll."
              className={`w-full px-4 py-3 rounded-xl border ${errors.asal_tim ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
            />
            {errors.asal_tim && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.asal_tim}</p>}
          </div>

          {/* Logo Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Logo Tim <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 flex items-center justify-center overflow-hidden">
                {teamData.logo_preview ? (
                  <img src={teamData.logo_preview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={24} className="text-teal-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-700 font-medium rounded-xl cursor-pointer hover:bg-teal-100 transition-colors border border-teal-200">
                  <Camera size={16} />
                  {teamData.logo_preview ? 'Ganti Logo' : 'Pilih Logo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, atau WebP. Maksimal 2MB</p>
              </div>
            </div>
            {errors.logo && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{errors.logo}</p>}
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
        <h3 className="text-xl font-bold text-teal-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">2</span>
          Data Pemain
        </h3>

        {errors.players && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} />
            {errors.players}
          </div>
        )}

        {/* Player Cards */}
        <div className="space-y-6">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              errors={errors}
              onUpdate={updatePlayer}
              onRemove={removePlayer}
              onPhotoChange={handlePlayerPhoto}
              canRemove={players.length > CONFIG.MIN_PLAYERS}
            />
          ))}
        </div>

        {/* Add Player Button */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Jumlah Pemain: <span className="font-bold text-teal-700">{players.length}</span> / {CONFIG.MAX_PLAYERS}
          </p>
          <button
            onClick={addPlayer}
            disabled={players.length >= CONFIG.MAX_PLAYERS}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            TAMBAH PEMAIN
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
        >
          <Check size={20} />
          LANJUT KE PRATINJAU
        </button>
      </div>
    </div>
  );
}

// Player Card Component
function PlayerCard({ player, index, errors, onUpdate, onRemove, onPhotoChange, canRemove }: {
  player: PlayerData;
  index: number;
  errors: Record<string, string>;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  onPhotoChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  canRemove: boolean;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          Pemain {index + 1}
        </h4>
        {canRemove && (
          <button
            onClick={() => onRemove(player.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus pemain"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Photo Upload */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Foto Pemain <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => photoInputRef.current?.click()}
            >
              {player.photo_preview ? (
                <img src={player.photo_preview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-sky-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-sm px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200"
              >
                {player.photo_preview ? 'Ganti Foto' : 'Pilih Foto'}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPhotoChange(player.id, e)}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Maks 2MB</p>
            </div>
          </div>
          {errors[`photo_${player.id}`] && <p className="mt-1 text-sm text-red-600">{errors[`photo_${player.id}`]}</p>}
        </div>

        {/* Nama Pemain */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={player.nama_pemain}
            onChange={(e) => onUpdate(player.id, 'nama_pemain', e.target.value)}
            placeholder="Nama lengkap pemain"
            className={`w-full px-4 py-2.5 rounded-xl border ${errors[`player_name_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`}
          />
          {errors[`player_name_${index}`] && <p className="mt-1 text-sm text-red-600">{errors[`player_name_${index}`]}</p>}
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={player.jenis_kelamin}
              onChange={(e) => onUpdate(player.id, 'jenis_kelamin', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors[`player_gender_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none appearance-none transition-all bg-white`}
            >
              <option value="">Pilih jenis kelamin</option>
              {JENIS_KELAMIN_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors[`player_gender_${index}`] && <p className="mt-1 text-sm text-red-600">{errors[`player_gender_${index}`]}</p>}
        </div>

        {/* Posisi Bermain */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Posisi Bermain <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={player.posisi}
              onChange={(e) => onUpdate(player.id, 'posisi', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors[`player_position_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none appearance-none transition-all bg-white`}
            >
              <option value="">Pilih posisi</option>
              {POSISI_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors[`player_position_${index}`] && <p className="mt-1 text-sm text-red-600">{errors[`player_position_${index}`]}</p>}
        </div>

        {/* Status Pemain */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status Pemain <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {STATUS_PEMAIN_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  player.status_pemain === opt.value
                    ? 'border-teal-400 bg-teal-50 text-teal-800 shadow-sm'
                    : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`status_${player.id}`}
                  value={opt.value}
                  checked={player.status_pemain === opt.value}
                  onChange={(e) => onUpdate(player.id, 'status_pemain', e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  player.status_pemain === opt.value ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {player.status_pemain === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  )}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors[`player_status_${index}`] && <p className="mt-1 text-sm text-red-600">{errors[`player_status_${index}`]}</p>}
        </div>
      </div>
    </div>
  );
}
