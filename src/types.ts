// Types for SOQ.COMM PADEL LEAGUE Registration System

export interface TeamData {
  nama_tim: string;
  nama_manajer: string;
  nomor_whatsapp: string;
  email_manajer: string;
  asal_tim: string;
  logo_file?: File | null;
  logo_preview?: string;
  logo_file_id?: string;
  logo_file_url?: string;
}

export interface PlayerData {
  id: string;
  nama_pemain: string;
  jenis_kelamin: 'PRIA' | 'WANITA' | '';
  posisi: 'KIRI' | 'KANAN' | 'KIRI_KANAN' | '';
  status_pemain: 'REGULER' | 'UNGULAN' | '';
  photo_file?: File | null;
  photo_preview?: string;
  photo_file_id?: string;
  photo_file_url?: string;
  player_registration_id?: string;
  nomor_urut?: number;
}

export interface Registration {
  registration_id: string;
  nomor_registrasi: string;
  nama_tim: string;
  nama_manajer: string;
  nomor_whatsapp: string;
  email_manajer: string;
  asal_tim: string;
  logo_file_id: string;
  logo_file_url: string;
  status_pendaftaran: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'PERLU_REVISI' | 'DITOLAK';
  catatan_admin: string;
  tanggal_pendaftaran: string;
  updated_at: string;
  players: PlayerData[];
}

export interface AppSettings {
  nama_kompetisi: string;
  tahun_kompetisi: string;
  batas_minimum_pemain: number;
  batas_maksimum_pemain: number;
  batas_ukuran_logo: number;
  batas_ukuran_foto: number;
  format_nomor_registrasi: string;
  informasi_kontak: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export type PositionLabel = 'Kiri' | 'Kanan' | 'Kiri & Kanan';
export type StatusLabel = 'Reguler' | 'Unggulan';
export type RegistrationStatusLabel = 'Menunggu Verifikasi' | 'Disetujui' | 'Perlu Revisi' | 'Ditolak';

export const POSISI_OPTIONS = [
  { value: 'KIRI', label: 'Kiri' },
  { value: 'KANAN', label: 'Kanan' },
  { value: 'KIRI_KANAN', label: 'Kiri & Kanan' },
] as const;

export const JENIS_KELAMIN_OPTIONS = [
  { value: 'PRIA', label: 'Pria' },
  { value: 'WANITA', label: 'Wanita' },
] as const;

export const STATUS_PEMAIN_OPTIONS = [
  { value: 'REGULER', label: 'Pemain Reguler' },
  { value: 'UNGGULAN', label: 'Pemain Unggulan' },
] as const;

export const STATUS_PENDAFTARAN = {
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800' },
  DISETUJUI: { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
  PERLU_REVISI: { label: 'Perlu Revisi', color: 'bg-orange-100 text-orange-800' },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
} as const;

export function getPositionLabel(value: string): string {
  const option = POSISI_OPTIONS.find(o => o.value === value);
  return option ? option.label : value;
}

export function getStatusPemainLabel(value: string): string {
  const option = STATUS_PEMAIN_OPTIONS.find(o => o.value === value);
  return option ? option.label : value;
}
