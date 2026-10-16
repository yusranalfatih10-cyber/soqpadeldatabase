# SOQ.COMM PADEL LEAGUE - Sistem Pendaftaran

## Panduan Deployment

### 1. Setup Google Sheets (Database)

1. Buat Google Spreadsheet baru di [Google Sheets](https://sheets.google.com)
2. Catat **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 2. Setup Google Drive (Penyimpanan File)

1. Buat folder baru di Google Drive untuk menyimpan logo dan foto
2. Catat **Folder ID** dari URL:
   `https://drive.google.com/drive/folders/FOLDER_ID`

### 3. Deploy Google Apps Script

1. Buka spreadsheet yang dibuat
2. Klik **Extensions** → **Apps Script**
3. Hapus kode default, salin seluruh isi file `public/google-apps-script/Code.gs`
4. Ubah konfigurasi di bagian atas file:
   ```javascript
   const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
   const DRIVE_FOLDER_ID = 'GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA';
   const ADMIN_USERNAME = 'admin'; // Ganti username admin
   const ADMIN_PASSWORD = 'password_aman_anda'; // Ganti password admin
   ```
5. Jalankan fungsi `setupSpreadsheet` sekali untuk membuat struktur sheet
6. Klik **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Salin **Web app URL** yang diberikan

### 4. Konfigurasi Frontend

Edit file `src/config.ts`:
```typescript
GAS_URL: 'PASTE_WEB_APP_URL_DISINI',
```

### 5. Build & Deploy Frontend

```bash
npm install
npm run build
```

File hasil build ada di folder `dist/`. Upload ke hosting Anda.

---

## Struktur Database

### Sheet: REGISTRATIONS
| Kolom | Deskripsi |
|-------|-----------|
| registration_id | UUID unik pendaftaran |
| nomor_registrasi | Format: SOQ-REG-2026-0001 |
| nama_tim | Nama tim/klub |
| nama_manajer | Nama manajer tim |
| nomor_whatsapp | Nomor WhatsApp manajer |
| email_manajer | Email manajer (opsional) |
| asal_tim | Kota/kabupaten asal |
| logo_file_id | ID file logo di Drive |
| logo_file_url | URL akses logo |
| status_pendaftaran | MENUNGGU_VERIFIKASI/DISETUJUI/PERLU_REVISI/DITOLAK |
| catatan_admin | Catatan dari panitia |
| tanggal_pendaftaran | Tanggal dan waktu pendaftaran |
| updated_at | Waktu terakhir diperbarui |

### Sheet: PLAYERS
| Kolom | Deskripsi |
|-------|-----------|
| player_registration_id | UUID unik pemain |
| registration_id | ID pendaftaran tim (relasi) |
| nomor_registrasi | Nomor registrasi tim |
| nama_tim | Nama tim |
| nomor_urut_pemain | Urutan pemain dalam tim |
| nama_pemain | Nama lengkap |
| jenis_kelamin | PRIA / WANITA |
| posisi | KIRI / KANAN / KIRI_KANAN |
| status_pemain | REGULER / UNGGULAN |
| photo_file_id | ID file foto di Drive |
| photo_file_url | URL akses foto |
| created_at | Waktu dibuat |
| updated_at | Waktu terakhir diperbarui |

### Sheet: SETTINGS
Konfigurasi aplikasi (batas pemain, ukuran file, dll.)

---

## Akses Admin

- URL: `[domain]/admin`
- Default: username `admin` (ubah di Apps Script)
- Token disimpan di sessionStorage (8 jam)

---

## Fitur

✅ Pendaftaran tim dengan logo  
✅ Input pemain individual (dinamis, tanpa batas pasangan)  
✅ Upload foto per pemain ke Google Drive  
✅ Pilihan posisi: Kiri, Kanan, Kiri & Kanan  
✅ Status pemain: Reguler / Unggulan  
✅ Pratinjau sebelum kirim  
✅ Nomor registrasi otomatis  
✅ Cek status pendaftaran  
✅ Dashboard admin lengkap  
✅ Edit/hapus pemain oleh admin  
✅ Verifikasi pendaftaran (setuju/revisi/tolak)  
✅ Ekspor data CSV  
✅ Responsif (mobile & desktop)  

---

## Logo

Logo resmi SOQ.COMM PADEL LEAGUE (tersimpan di konfigurasi `src/config.ts`)

---

## Teknologi

- **Frontend**: React 18 + Vite + Tailwind CSS 4
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Storage**: Google Drive
- **Routing**: React Router v6
- **Icons**: Lucide React
