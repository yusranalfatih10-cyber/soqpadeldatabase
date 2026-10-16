# SOQ.COMM PADEL LEAGUE - Panduan Lengkap

## 📋 Ringkasan Aplikasi

Aplikasi web pendaftaran resmi untuk SOQ.COMM PADEL LEAGUE di Provinsi Papua Barat Daya telah berhasil dibangun dengan fitur lengkap dan siap digunakan.

### ✨ Fitur Utama

✅ **Pendaftaran Tim & Pemain**
- Formulir pendaftaran tim dengan upload logo
- Input data pemain individual (dinamis, tanpa batas pasangan)
- Upload foto setiap pemain ke Google Drive
- Pilihan posisi: Kiri, Kanan, Kiri & Kanan
- Status pemain: Reguler / Unggulan
- Validasi lengkap di frontend dan backend

✅ **Sistem Registrasi**
- Nomor registrasi otomatis (format: SOQ-REG-2026-XXXX)
- Halaman pratinjau sebelum kirim
- Halaman konfirmasi setelah pendaftaran berhasil
- Cek status pendaftaran real-time

✅ **Dashboard Admin**
- Login admin dengan autentikasi
- Lihat semua pendaftaran
- Filter dan pencarian
- Edit data tim dan pemain
- Verifikasi pendaftaran (Setujui/Revisi/Tolak)
- Tambah/hapus pemain
- Export data ke CSV

✅ **Penyimpanan Data**
- Database: Google Sheets (3 sheet: REGISTRATIONS, PLAYERS, SETTINGS)
- File storage: Google Drive (logo tim, foto pemain)
- Backend: Google Apps Script (Web App)

✅ **Desain & UX**
- Responsif (mobile, tablet, desktop)
- Logo resmi dari link yang diberikan
- Palet warna: Turquoise, Sky Blue, Lime Green, Coral
- Animasi smooth dan modern

---

## 🚀 Cara Deploy

### 1. Setup Google Sheets (Database)

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama: **SOQ PADEL LEAGUE - Database**
3. Salin **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_INI/edit
   ```

### 2. Setup Google Drive (File Storage)

1. Buka [Google Drive](https://drive.google.com)
2. Buat folder baru: **SOQ PADEL LEAGUE**
3. Salin **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_INI
   ```
4. Buat 3 sub-folder di dalamnya:
   - `LOGO_TIM`
   - `FOTO_PEMAIN`
   - `DOKUMEN_PENDAFTARAN`

### 3. Deploy Google Apps Script

1. Buka spreadsheet yang sudah dibuat
2. Klik **Extensions** → **Apps Script**
3. Hapus kode default, salin seluruh isi file:
   ```
   public/google-apps-script/Code.gs
   ```
4. Ubah konfigurasi di bagian atas:
   ```javascript
   const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
   const DRIVE_FOLDER_ID = 'GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA';
   const ADMIN_USERNAME = 'admin';
   const ADMIN_PASSWORD = 'password_aman_anda';
   ```
5. Pilih fungsi `setupSpreadsheet` dari dropdown
6. Klik tombol **Run** (▶)
7. Berikan izin akses yang diminta
8. Deploy sebagai Web App:
   - Klik **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**
9. Salin **Web App URL** yang diberikan

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

Upload folder `dist/` ke hosting Anda.

---

## 📖 Panduan Deploy Lengkap

Panduan deploy yang lebih detail tersedia di dalam aplikasi:
- URL: `#/panduan-deploy`
- Atau klik link "📖 Panduan Deploy" di footer halaman utama

Panduan mencakup:
- Persiapan akun Google
- Langkah-langkah detail dengan screenshot
- Troubleshooting umum
- Best practices keamanan
- Checklist akhir deployment

---

## 🗂️ Struktur Database

### Sheet: REGISTRATIONS
Menyimpan data pendaftaran tim:
- `registration_id` - UUID unik
- `nomor_registrasi` - Format: SOQ-REG-2026-0001
- `nama_tim`, `nama_manajer`, `nomor_whatsapp`, `email_manajer`
- `asal_tim` - Kota/kabupaten
- `logo_file_id`, `logo_file_url` - Referensi file di Drive
- `status_pendaftaran` - MENUNGGU_VERIFIKASI/DISETUJUI/PERLU_REVISI/DITOLAK
- `catatan_admin` - Catatan dari panitia
- `tanggal_pendaftaran`, `updated_at`

### Sheet: PLAYERS
Menyimpan data pemain individual:
- `player_registration_id` - UUID unik pemain
- `registration_id` - Relasi ke pendaftaran tim
- `nomor_urut_pemain` - Urutan dalam tim
- `nama_pemain`, `jenis_kelamin` (PRIA/WANITA)
- `posisi` (KIRI/KANAN/KIRI_KANAN)
- `status_pemain` (REGULER/UNGGULAN)
- `photo_file_id`, `photo_file_url` - Referensi foto di Drive
- `created_at`, `updated_at`

### Sheet: SETTINGS
Konfigurasi aplikasi (batas pemain, ukuran file, dll.)

---

## 🔐 Akses Admin

- **URL**: `[domain]/#/admin`
- **Default credentials**:
  - Username: `admin`
  - Password: (sesuai yang diatur di Apps Script)
- **Session**: Token disimpan di sessionStorage (8 jam)

---

## 🎨 Identitas Visual

### Logo
- URL: `https://img.sanishtech.com/u/cb70e0abf0459322f04ece405a754457.jpg`
- Digunakan di: Header, Hero section, Favicon, Halaman pendaftaran, Dashboard admin

### Palet Warna
- **Primary**: Turquoise/Teal (#0d9488, #14b8a6)
- **Secondary**: Sky Blue (#0284c7, #0ea5e9)
- **Accent 1**: Lime Green (#84cc16, #a3e635)
- **Accent 2**: Coral/Orange (#f97316, #fb923c)
- **Background**: Gradient dari teal-50 ke sky-50

---

## 📱 Halaman Aplikasi

1. **Beranda** (`/`)
   - Hero section dengan logo dan CTA
   - Informasi tahapan pendaftaran
   - Link ke panduan deploy

2. **Pendaftaran** (`/daftar`)
   - Form data tim (nama, manajer, WhatsApp, email, asal, logo)
   - Input pemain dinamis (tambah/hapus)
   - Upload foto per pemain
   - Pilihan posisi dan status pemain

3. **Pratinjau** (`/pratinjau`)
   - Review data sebelum kirim
   - Edit kembali jika perlu

4. **Konfirmasi** (`/konfirmasi`)
   - Nomor registrasi
   - Informasi pendaftaran berhasil
   - Link cek status

5. **Cek Status** (`/cek-status`)
   - Input nomor registrasi
   - Tampilkan status dan detail

6. **Admin Login** (`/admin`)
   - Form login

7. **Admin Dashboard** (`/admin/dashboard`)
   - Statistik pendaftaran
   - Tabel semua pendaftaran
   - Filter dan pencarian
   - Export CSV

8. **Admin Detail** (`/admin/detail/:id`)
   - Detail pendaftaran
   - Edit data tim dan pemain
   - Verifikasi (Setujui/Revisi/Tolak)
   - Tambah/hapus pemain

9. **Panduan Deploy** (`/panduan-deploy`)
   - Tutorial lengkap step-by-step
   - Troubleshooting
   - Checklist deployment

---

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v6 (HashRouter)
- **Icons**: Lucide React
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **File Storage**: Google Drive

---

## ✅ Testing Checklist

### Pendaftaran Tim
- [ ] Isi data tim lengkap
- [ ] Upload logo
- [ ] Tambah minimal 2 pemain
- [ ] Upload foto pemain
- [ ] Pilih posisi dan status
- [ ] Kirim pendaftaran
- [ ] Cek nomor registrasi muncul
- [ ] Verifikasi data tersimpan di Sheets
- [ ] Verifikasi file tersimpan di Drive

### Cek Status
- [ ] Input nomor registrasi
- [ ] Status tampil dengan benar
- [ ] Data tim dan pemain tampil

### Admin
- [ ] Login berhasil
- [ ] Dashboard menampilkan data
- [ ] Filter dan pencarian berfungsi
- [ ] Edit data tim berhasil
- [ ] Edit data pemain berhasil
- [ ] Tambah pemain berhasil
- [ ] Hapus pemain berhasil
- [ ] Verifikasi status berubah
- [ ] Export CSV berhasil

### Responsivitas
- [ ] Tampil baik di mobile
- [ ] Tampil baik di tablet
- [ ] Tampil baik di desktop
- [ ] Form mudah diisi di mobile
- [ ] Foto tidak terpotong

---

## 🐛 Troubleshooting Umum

### Error: "Script function not found"
**Solusi**: Jalankan fungsi `setupSpreadsheet` di Apps Script editor

### Error: "Tidak punya akses ke spreadsheet"
**Solusi**: Pastikan SPREADSHEET_ID benar dan Apps Script dijalankan dengan akun yang sama

### Error: "Tidak punya akses ke Drive"
**Solusi**: Pastikan FOLDER_ID benar dan berikan izin akses saat pertama kali deploy

### CORS Error di frontend
**Solusi**: Pastikan Web App di-deploy dengan "Who has access: Anyone"

### File upload gagal
**Solusi**: Periksa ukuran file (maks 2MB), pastikan folder Drive ada

### Data tidak muncul di admin
**Solusi**: Token admin expired (8 jam), login ulang

### URL Web App berubah setelah update
**Solusi**: Gunakan "Manage deployments" → edit → "New version", jangan buat deployment baru

---

## 📞 Kontak & Support

Untuk bantuan lebih lanjut:
- Lihat panduan deploy di aplikasi: `#/panduan-deploy`
- Periksa Execution Log di Apps Script untuk debugging
- Backup spreadsheet secara berkala

---

## 📝 Catatan Penting

1. **Keamanan**: Ganti password admin default segera setelah deploy
2. **Backup**: Lakukan backup spreadsheet secara rutin
3. **Rate Limit**: Apps Script gratis memiliki batas 20.000 request/hari
4. **File Access**: File di Drive sharing-nya "Anyone with link can view"
5. **Token Session**: Admin token valid selama 8 jam

---

## 🎉 Selesai!

Aplikasi pendaftaran SOQ.COMM PADEL LEAGUE siap digunakan. Pastikan semua konfigurasi sudah benar dan lakukan testing menyeluruh sebelum digunakan untuk pendaftaran resmi.

**Selamat berkompetisi!** 🏆
