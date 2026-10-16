/**
 * ============================================================
 * SOQ.COMM PADEL LEAGUE - Google Apps Script Backend
 * ============================================================
 * 
 * SISTEM PENDAFTARAN RESMI TIM DAN PEMAIN
 * Provinsi Papua Barat Daya
 * 
 * FITUR:
 * - Pendaftaran tim dengan logo
 * - Input pemain individual (dinamis)
 * - Upload foto pemain ke Google Drive
 * - Dashboard admin dengan verifikasi
 * - Export data ke CSV
 * 
 * DEPLOYMENT:
 * 1. Buat Google Spreadsheet baru
 * 2. Buat folder di Google Drive
 * 3. Salin kode ini ke Apps Script editor
 * 4. Ubah konfigurasi di bawah
 * 5. Jalankan setupSpreadsheet()
 * 6. Deploy sebagai Web App (Execute as: Me, Access: Anyone)
 * 7. Salin URL deployment ke frontend
 * 
 * ============================================================
 */

// ============ KONFIGURASI UTAMA ============
// GANTI DENGAN ID ANDA
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';

// Kredensial Admin (GANTI DENGAN YANG AMAN)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'your_secure_password_here';

// Durasi session admin (dalam detik) - 8 jam
const SESSION_DURATION = 8 * 60 * 60;

// Batas ukuran file (dalam bytes) - 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Format nomor registrasi
const REGISTRATION_PREFIX = 'SOQ-REG';

// ============ ENTRY POINTS ============

/**
 * Handler untuk GET requests
 */
function doGet(e) {
  const action = e.parameter.action;
  let result;
  
  try {
    Logger.log('GET request received: ' + action);
    
    switch(action) {
      case 'getSettings':
        result = handleGetSettings();
        break;
      case 'checkStatus':
        result = handleCheckStatus(e.parameter.nomor_registrasi);
        break;
      case 'getRegistration':
        result = handleGetRegistration(e.parameter.registration_id);
        break;
      case 'adminGetAll':
        result = handleAdminGetAll(e.parameter.token);
        break;
      case 'adminExportCSV':
        result = handleAdminExportCSV(e.parameter.token);
        break;
      default:
        result = { 
          success: false, 
          message: 'Action tidak valid: ' + action 
        };
    }
  } catch(error) {
    Logger.log('Error in doGet: ' + error.toString());
    result = { 
      success: false, 
      message: 'Terjadi kesalahan server',
      error: error.toString()
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handler untuk POST requests
 */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Format data tidak valid'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = data.action;
  let result;
  
  try {
    Logger.log('POST request received: ' + action);
    
    switch(action) {
      case 'registerTeam':
        result = handleRegisterTeam(data);
        break;
      case 'uploadFile':
        result = handleUploadFile(data);
        break;
      case 'adminLogin':
        result = handleAdminLogin(data);
        break;
      case 'adminUpdateStatus':
        result = handleAdminUpdateStatus(data);
        break;
      case 'adminUpdateTeam':
        result = handleAdminUpdateTeam(data);
        break;
      case 'adminUpdatePlayer':
        result = handleAdminUpdatePlayer(data);
        break;
      case 'adminAddPlayer':
        result = handleAdminAddPlayer(data);
        break;
      case 'adminDeletePlayer':
        result = handleAdminDeletePlayer(data);
        break;
      case 'adminDeleteRegistration':
        result = handleAdminDeleteRegistration(data);
        break;
      default:
        result = { 
          success: false, 
          message: 'Action tidak valid: ' + action 
        };
    }
  } catch(error) {
    Logger.log('Error in doPost: ' + error.toString());
    result = { 
      success: false, 
      message: 'Terjadi kesalahan server',
      error: error.toString()
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============ HANDLERS - PUBLIC ============

/**
 * Ambil pengaturan aplikasi
 */
function handleGetSettings() {
  const sheet = getSheet('SETTINGS');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[data[i][0]] = data[i][1];
    }
  }
  
  return { 
    success: true, 
    message: 'Pengaturan berhasil diambil',
    data: settings 
  };
}

/**
 * Cek status pendaftaran berdasarkan nomor registrasi
 */
function handleCheckStatus(nomorRegistrasi) {
  if (!nomorRegistrasi || !nomorRegistrasi.trim()) {
    return { 
      success: false, 
      message: 'Nomor registrasi wajib diisi' 
    };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  const headers = regData[0];
  
  let registration = null;
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][1] === nomorRegistrasi.trim()) {
      registration = rowToObject(headers, regData[i]);
      break;
    }
  }
  
  if (!registration) {
    return { 
      success: false, 
      message: 'Nomor registrasi tidak ditemukan' 
    };
  }
  
  // Ambil data pemain
  registration.players = getPlayersByRegistrationId(registration.registration_id);
  
  return { 
    success: true, 
    message: 'Data pendaftaran ditemukan',
    data: registration 
  };
}

/**
 * Ambil detail pendaftaran berdasarkan ID
 */
function handleGetRegistration(registrationId) {
  if (!registrationId) {
    return { 
      success: false, 
      message: 'ID pendaftaran tidak valid' 
    };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  const headers = regData[0];
  
  let registration = null;
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === registrationId) {
      registration = rowToObject(headers, regData[i]);
      break;
    }
  }
  
  if (!registration) {
    return { 
      success: false, 
      message: 'Data pendaftaran tidak ditemukan' 
    };
  }
  
  registration.players = getPlayersByRegistrationId(registration.registration_id);
  
  return { 
    success: true, 
    message: 'Data pendaftaran ditemukan',
    data: registration 
  };
}

/**
 * Daftarkan tim baru
 */
function handleRegisterTeam(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const team = data.team;
    const players = data.players;
    
    // Validasi data tim
    if (!team.nama_tim || !team.nama_tim.trim()) {
      return { success: false, message: 'Nama tim wajib diisi' };
    }
    if (!team.nama_manajer || !team.nama_manajer.trim()) {
      return { success: false, message: 'Nama manajer wajib diisi' };
    }
    if (!team.nomor_whatsapp || !team.nomor_whatsapp.trim()) {
      return { success: false, message: 'Nomor WhatsApp wajib diisi' };
    }
    if (!team.asal_tim || !team.asal_tim.trim()) {
      return { success: false, message: 'Asal tim wajib diisi' };
    }
    
    // Validasi pemain
    if (!players || players.length < 2) {
      return { success: false, message: 'Minimal 2 pemain harus didaftarkan' };
    }
    
    const validPositions = ['KIRI', 'KANAN', 'KIRI_KANAN'];
    const validStatuses = ['REGULER', 'UNGGULAN'];
    const validGenders = ['PRIA', 'WANITA'];
    
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.nama_pemain || !p.nama_pemain.trim()) {
        return { success: false, message: `Nama pemain ke-${i+1} wajib diisi` };
      }
      if (!validGenders.includes(p.jenis_kelamin)) {
        return { success: false, message: `Jenis kelamin pemain ke-${i+1} tidak valid` };
      }
      if (!validPositions.includes(p.posisi)) {
        return { success: false, message: `Posisi pemain ke-${i+1} tidak valid` };
      }
      if (!validStatuses.includes(p.status_pemain)) {
        return { success: false, message: `Status pemain ke-${i+1} tidak valid` };
      }
    }
    
    // Cek duplikasi nama tim
    const regSheet = getSheet('REGISTRATIONS');
    const regData = regSheet.getDataRange().getValues();
    
    for (let i = 1; i < regData.length; i++) {
      if (regData[i][2] && regData[i][2].toLowerCase() === team.nama_tim.trim().toLowerCase()) {
        return { success: false, message: 'Nama tim sudah terdaftar. Gunakan nama lain.' };
      }
    }
    
    // Generate ID dan nomor registrasi
    const registrationId = Utilities.getUuid();
    const nomorRegistrasi = generateNomorRegistrasi(regData);
    const now = new Date();
    const tanggalPendaftaran = Utilities.formatDate(now, 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
    
    // Simpan data tim
    regSheet.appendRow([
      registrationId,
      nomorRegistrasi,
      team.nama_tim.trim(),
      team.nama_manajer.trim(),
      team.nomor_whatsapp.trim(),
      team.email_manajer ? team.email_manajer.trim() : '',
      team.asal_tim.trim(),
      team.logo_file_id || '',
      team.logo_file_url || '',
      'MENUNGGU_VERIFIKASI',
      '',
      tanggalPendaftaran,
      tanggalPendaftaran
    ]);
    
    // Simpan data pemain
    const playerSheet = getSheet('PLAYERS');
    
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const playerRegId = Utilities.getUuid();
      
      playerSheet.appendRow([
        playerRegId,
        registrationId,
        nomorRegistrasi,
        team.nama_tim.trim(),
        i + 1,
        p.nama_pemain.trim(),
        p.jenis_kelamin,
        p.posisi,
        p.status_pemain,
        p.photo_file_id || '',
        p.photo_file_url || '',
        tanggalPendaftaran,
        tanggalPendaftaran
      ]);
    }
    
    Logger.log('Registration successful: ' + nomorRegistrasi);
    
    return {
      success: true,
      message: 'Pendaftaran berhasil',
      data: {
        registration_id: registrationId,
        nomor_registrasi: nomorRegistrasi,
        nama_tim: team.nama_tim,
        jumlah_pemain: players.length,
        tanggal_pendaftaran: tanggalPendaftaran,
        status_pendaftaran: 'MENUNGGU_VERIFIKASI'
      }
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Upload file ke Google Drive
 */
function handleUploadFile(data) {
  try {
    const { fileName, fileType, fileData, folder } = data;
    
    if (!fileData) {
      return { success: false, message: 'Data file kosong' };
    }
    
    if (!fileName || !fileType || !folder) {
      return { success: false, message: 'Parameter file tidak lengkap' };
    }
    
    // Decode base64
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), fileType, fileName);
    
    // Get or create folder
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    let targetFolder;
    
    const folders = parentFolder.getFoldersByName(folder);
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = parentFolder.createFolder(folder);
      Logger.log('Created folder: ' + folder);
    }
    
    // Save file
    const file = targetFolder.createFile(blob);
    
    // Set sharing permission
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    const fileUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    Logger.log('File uploaded: ' + fileName + ' -> ' + fileId);
    
    return {
      success: true,
      message: 'File berhasil diunggah',
      data: { 
        fileId: fileId, 
        fileUrl: fileUrl 
      }
    };
  } catch(error) {
    Logger.log('Upload error: ' + error.toString());
    return { 
      success: false, 
      message: 'Gagal mengunggah file: ' + error.toString() 
    };
  }
}

// ============ HANDLERS - ADMIN ============

/**
 * Login admin
 */
function handleAdminLogin(data) {
  const { username, password } = data;
  
  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi' };
  }
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Utilities.getUuid();
    const cache = CacheService.getScriptCache();
    cache.put('admin_token_' + token, 'valid', SESSION_DURATION);
    
    Logger.log('Admin login successful: ' + username);
    
    return { 
      success: true, 
      message: 'Login berhasil',
      data: { token: token } 
    };
  }
  
  Logger.log('Admin login failed: ' + username);
  
  return { 
    success: false, 
    message: 'Username atau password salah' 
  };
}

/**
 * Ambil semua pendaftaran (admin)
 */
function handleAdminGetAll(token) {
  if (!validateAdminToken(token)) {
    return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  const headers = regData[0];
  
  const registrations = [];
  
  for (let i = 1; i < regData.length; i++) {
    const reg = rowToObject(headers, regData[i]);
    reg.players = getPlayersByRegistrationId(reg.registration_id);
    registrations.push(reg);
  }
  
  return { 
    success: true, 
    message: 'Data berhasil diambil',
    data: registrations 
  };
}

/**
 * Update status pendaftaran
 */
function handleAdminUpdateStatus(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const { registration_id, status, catatan } = data;
  const validStatuses = ['MENUNGGU_VERIFIKASI', 'DISETUJUI', 'PERLU_REVISI', 'DITOLAK'];
  
  if (!validStatuses.includes(status)) {
    return { success: false, message: 'Status tidak valid' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === registration_id) {
      const now = Utilities.formatDate(new Date(), 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
      
      regSheet.getRange(i + 1, 10).setValue(status);
      regSheet.getRange(i + 1, 11).setValue(catatan || '');
      regSheet.getRange(i + 1, 13).setValue(now);
      
      Logger.log('Status updated: ' + registration_id + ' -> ' + status);
      
      return { success: true, message: 'Status berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

/**
 * Update data tim
 */
function handleAdminUpdateTeam(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === data.registration_id) {
      const now = Utilities.formatDate(new Date(), 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
      
      if (data.nama_tim) regSheet.getRange(i + 1, 3).setValue(data.nama_tim);
      if (data.nama_manajer) regSheet.getRange(i + 1, 4).setValue(data.nama_manajer);
      if (data.nomor_whatsapp) regSheet.getRange(i + 1, 5).setValue(data.nomor_whatsapp);
      if (data.email_manajer !== undefined) regSheet.getRange(i + 1, 6).setValue(data.email_manajer);
      if (data.asal_tim) regSheet.getRange(i + 1, 7).setValue(data.asal_tim);
      
      regSheet.getRange(i + 1, 13).setValue(now);
      
      Logger.log('Team updated: ' + data.registration_id);
      
      return { success: true, message: 'Data tim berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

/**
 * Update data pemain
 */
function handleAdminUpdatePlayer(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  
  for (let i = 1; i < playerData.length; i++) {
    if (playerData[i][0] === data.player_registration_id) {
      const now = Utilities.formatDate(new Date(), 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
      
      if (data.nama_pemain) playerSheet.getRange(i + 1, 6).setValue(data.nama_pemain);
      if (data.jenis_kelamin) playerSheet.getRange(i + 1, 7).setValue(data.jenis_kelamin);
      if (data.posisi) playerSheet.getRange(i + 1, 8).setValue(data.posisi);
      if (data.status_pemain) playerSheet.getRange(i + 1, 9).setValue(data.status_pemain);
      if (data.photo_file_id) playerSheet.getRange(i + 1, 10).setValue(data.photo_file_id);
      if (data.photo_file_url) playerSheet.getRange(i + 1, 11).setValue(data.photo_file_url);
      
      playerSheet.getRange(i + 1, 13).setValue(now);
      
      Logger.log('Player updated: ' + data.player_registration_id);
      
      return { success: true, message: 'Data pemain berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pemain tidak ditemukan' };
}

/**
 * Tambah pemain baru ke pendaftaran
 */
function handleAdminAddPlayer(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  // Cari pendaftaran
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  let registration = null;
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === data.registration_id) {
      registration = { 
        nomor_registrasi: regData[i][1], 
        nama_tim: regData[i][2] 
      };
      break;
    }
  }
  
  if (!registration) {
    return { success: false, message: 'Pendaftaran tidak ditemukan' };
  }
  
  // Hitung urutan pemain
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  let maxUrut = 0;
  
  for (let i = 1; i < playerData.length; i++) {
    if (playerData[i][1] === data.registration_id) {
      maxUrut = Math.max(maxUrut, playerData[i][4]);
    }
  }
  
  const playerRegId = Utilities.getUuid();
  const now = Utilities.formatDate(new Date(), 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
  
  playerSheet.appendRow([
    playerRegId,
    data.registration_id,
    registration.nomor_registrasi,
    registration.nama_tim,
    maxUrut + 1,
    data.nama_pemain || '',
    data.jenis_kelamin || '',
    data.posisi || '',
    data.status_pemain || '',
    data.photo_file_id || '',
    data.photo_file_url || '',
    now,
    now
  ]);
  
  Logger.log('Player added: ' + playerRegId);
  
  return { 
    success: true, 
    message: 'Pemain berhasil ditambahkan',
    data: { player_registration_id: playerRegId } 
  };
}

/**
 * Hapus pemain
 */
function handleAdminDeletePlayer(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  
  for (let i = 1; i < playerData.length; i++) {
    if (playerData[i][0] === data.player_registration_id) {
      playerSheet.deleteRow(i + 1);
      
      Logger.log('Player deleted: ' + data.player_registration_id);
      
      return { success: true, message: 'Pemain berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Pemain tidak ditemukan' };
}

/**
 * Hapus seluruh pendaftaran
 */
function handleAdminDeleteRegistration(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  // Hapus pemain terlebih dahulu
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  
  for (let i = playerData.length - 1; i >= 1; i--) {
    if (playerData[i][1] === data.registration_id) {
      playerSheet.deleteRow(i + 1);
    }
  }
  
  // Hapus pendaftaran
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === data.registration_id) {
      regSheet.deleteRow(i + 1);
      
      Logger.log('Registration deleted: ' + data.registration_id);
      
      return { success: true, message: 'Pendaftaran berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

/**
 * Export data ke CSV
 */
function handleAdminExportCSV(token) {
  if (!validateAdminToken(token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const playerSheet = getSheet('PLAYERS');
  const regData = regSheet.getDataRange().getValues();
  const playerData = playerSheet.getDataRange().getValues();
  
  // Build CSV header
  let csv = 'Nomor Registrasi,Nama Tim,Manajer,WhatsApp,Email,Asal Tim,Status,Tanggal,Nama Pemain,Jenis Kelamin,Posisi,Status Pemain\n';
  
  // Build CSV rows - setiap pemain sebagai baris terpisah
  for (let i = 1; i < playerData.length; i++) {
    const p = playerData[i];
    
    // Cari registrasi yang sesuai
    let reg = null;
    for (let j = 1; j < regData.length; j++) {
      if (regData[j][0] === p[1]) {
        reg = regData[j];
        break;
      }
    }
    
    if (reg) {
      csv += '"' + reg[1] + '","' + reg[2] + '","' + reg[3] + '","' + 
             reg[4] + '","' + reg[5] + '","' + reg[6] + '","' + reg[9] + '","' + 
             reg[11] + '","' + p[5] + '","' + p[6] + '","' + p[7] + '","' + p[8] + '"\n';
    }
  }
  
  // Simpan CSV ke Drive
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const fileName = 'SOQ_Export_' + new Date().toISOString().split('T')[0] + '.csv';
  const blob = Utilities.newBlob(csv, 'text/csv', fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  Logger.log('CSV exported: ' + fileName);
  
  return {
    success: true,
    message: 'Data berhasil diekspor',
    data: { 
      csvUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId() 
    }
  };
}

// ============ HELPER FUNCTIONS ============

/**
 * Ambil atau buat sheet
 */
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    
    // Inisialisasi headers berdasarkan nama sheet
    if (name === 'REGISTRATIONS') {
      sheet.appendRow([
        'registration_id', 'nomor_registrasi', 'nama_tim', 'nama_manajer',
        'nomor_whatsapp', 'email_manajer', 'asal_tim', 'logo_file_id',
        'logo_file_url', 'status_pendaftaran', 'catatan_admin',
        'tanggal_pendaftaran', 'updated_at'
      ]);
      
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0d9488');
      headerRange.setFontColor('#ffffff');
      
    } else if (name === 'PLAYERS') {
      sheet.appendRow([
        'player_registration_id', 'registration_id', 'nomor_registrasi',
        'nama_tim', 'nomor_urut_pemain', 'nama_pemain', 'jenis_kelamin',
        'posisi', 'status_pemain', 'photo_file_id', 'photo_file_url',
        'created_at', 'updated_at'
      ]);
      
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0284c7');
      headerRange.setFontColor('#ffffff');
      
    } else if (name === 'SETTINGS') {
      sheet.appendRow(['key', 'value']);
      
      // Default settings
      sheet.appendRow(['nama_kompetisi', 'SOQ.COMM PADEL LEAGUE']);
      sheet.appendRow(['tahun_kompetisi', '2026']);
      sheet.appendRow(['batas_minimum_pemain', '2']);
      sheet.appendRow(['batas_maksimum_pemain', '20']);
      sheet.appendRow(['batas_ukuran_logo', '2097152']);
      sheet.appendRow(['batas_ukuran_foto', '2097152']);
      
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, 2);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#84cc16');
      headerRange.setFontColor('#ffffff');
    }
    
    Logger.log('Sheet created: ' + name);
  }
  
  return sheet;
}

/**
 * Konversi row ke object
 */
function rowToObject(headers, row) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i] !== undefined ? row[i] : '';
  }
  return obj;
}

/**
 * Ambil semua pemain berdasarkan registration_id
 */
function getPlayersByRegistrationId(registrationId) {
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  const headers = playerData[0];
  const players = [];
  
  for (let i = 1; i < playerData.length; i++) {
    if (playerData[i][1] === registrationId) {
      players.push(rowToObject(headers, playerData[i]));
    }
  }
  
  // Sort berdasarkan nomor urut
  players.sort(function(a, b) {
    return (a.nomor_urut_pemain || 0) - (b.nomor_urut_pemain || 0);
  });
  
  return players;
}

/**
 * Generate nomor registrasi unik
 */
function generateNomorRegistrasi(existingData) {
  const year = new Date().getFullYear();
  let maxNum = 0;
  
  for (let i = 1; i < existingData.length; i++) {
    const nomor = existingData[i][1];
    if (nomor && nomor.indexOf(REGISTRATION_PREFIX + '-' + year + '-') !== -1) {
      const parts = nomor.split('-');
      const num = parseInt(parts[parts.length - 1]);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  
  const nextNum = (maxNum + 1).toString();
  while (nextNum.length < 4) {
    nextNum = '0' + nextNum;
  }
  
  return REGISTRATION_PREFIX + '-' + year + '-' + nextNum;
}

/**
 * Validasi token admin
 */
function validateAdminToken(token) {
  if (!token) {
    return false;
  }
  
  const cache = CacheService.getScriptCache();
  const cached = cache.get('admin_token_' + token);
  
  return cached === 'valid';
}

// ============ SETUP & UTILITIES ============

/**
 * Setup awal - jalankan sekali setelah deploy
 */
function setupSpreadsheet() {
  Logger.log('Starting setup...');
  
  // Buat sheets
  getSheet('REGISTRATIONS');
  getSheet('PLAYERS');
  getSheet('SETTINGS');
  
  // Verifikasi folder Drive
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    Logger.log('Drive folder verified: ' + folder.getName());
  } catch(error) {
    Logger.log('ERROR: Drive folder not accessible - ' + error.toString());
    throw new Error('Folder Drive tidak dapat diakses. Periksa DRIVE_FOLDER_ID.');
  }
  
  Logger.log('Setup complete!');
  Logger.log('');
  Logger.log('Next steps:');
  Logger.log('1. Deploy as Web App (Execute as: Me, Access: Anyone)');
  Logger.log('2. Copy Web App URL to frontend config.ts');
  Logger.log('3. Test the application');
}

/**
 * Test function - untuk debugging
 */
function testSetup() {
  Logger.log('Testing setup...');
  
  // Test spreadsheet access
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Spreadsheet accessible: ' + ss.getName());
  } catch(error) {
    Logger.log('✗ Spreadsheet error: ' + error.toString());
  }
  
  // Test Drive access
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    Logger.log('✓ Drive folder accessible: ' + folder.getName());
  } catch(error) {
    Logger.log('✗ Drive error: ' + error.toString());
  }
  
  // Test sheets
  try {
    const regSheet = getSheet('REGISTRATIONS');
    Logger.log('✓ REGISTRATIONS sheet: ' + regSheet.getLastRow() + ' rows');
  } catch(error) {
    Logger.log('✗ REGISTRATIONS error: ' + error.toString());
  }
  
  try {
    const playerSheet = getSheet('PLAYERS');
    Logger.log('✓ PLAYERS sheet: ' + playerSheet.getLastRow() + ' rows');
  } catch(error) {
    Logger.log('✗ PLAYERS error: ' + error.toString());
  }
  
  try {
    const settingsSheet = getSheet('SETTINGS');
    Logger.log('✓ SETTINGS sheet: ' + settingsSheet.getLastRow() + ' rows');
  } catch(error) {
    Logger.log('✗ SETTINGS error: ' + error.toString());
  }
  
  Logger.log('');
  Logger.log('Test complete!');
}

/**
 * Hapus semua data - PERINGATAN: Tidak dapat dibatalkan!
 */
function clearAllData() {
  Logger.log('WARNING: This will delete all registration data!');
  Logger.log('Comment out this function after use.');
  
  const regSheet = getSheet('REGISTRATIONS');
  const playerSheet = getSheet('PLAYERS');
  
  // Keep headers, delete data
  if (regSheet.getLastRow() > 1) {
    regSheet.deleteRows(2, regSheet.getLastRow() - 1);
    Logger.log('REGISTRATIONS cleared');
  }
  
  if (playerSheet.getLastRow() > 1) {
    playerSheet.deleteRows(2, playerSheet.getLastRow() - 1);
    Logger.log('PLAYERS cleared');
  }
  
  Logger.log('All data cleared!');
}
