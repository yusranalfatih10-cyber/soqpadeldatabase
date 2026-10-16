/**
 * ============================================================
 * SOQ.COMM PADEL LEAGUE - Google Apps Script Backend
 * ============================================================
 * 
 * INSTRUKSI DEPLOYMENT:
 * 
 * 1. Buat Google Spreadsheet baru sebagai database
 * 2. Buka Extensions > Apps Script
 * 3. Salin seluruh kode ini ke editor Apps Script
 * 4. Ganti SPREADSHEET_ID dengan ID spreadsheet Anda
 * 5. Ganti FOLDER_ID dengan ID folder Google Drive tujuan
 * 6. Deploy sebagai Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Salin URL deployment ke CONFIG.GAS_URL di frontend
 * 
 * STRUKTUR SPREADSHEET:
 * - Sheet "REGISTRATIONS": Data pendaftaran tim
 * - Sheet "PLAYERS": Data pemain individual
 * - Sheet "SETTINGS": Konfigurasi aplikasi
 * 
 * ============================================================
 */

// ============ KONFIGURASI ============
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'your_secure_password_here';
const SESSION_DURATION_HOURS = 8;

// ============ ENTRY POINTS ============

function doGet(e) {
  const action = e.parameter.action;
  let result;
  
  try {
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
        result = { success: false, message: 'Action tidak valid' };
    }
  } catch(error) {
    result = { success: false, message: 'Terjadi kesalahan server', error: error.toString() };
    Logger.log(error);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  let result;
  
  try {
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
        result = { success: false, message: 'Action tidak valid' };
    }
  } catch(error) {
    result = { success: false, message: 'Terjadi kesalahan server', error: error.toString() };
    Logger.log(error);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============ HANDLERS ============

function handleGetSettings() {
  const sheet = getSheet('SETTINGS');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  
  return { success: true, data: settings };
}

function handleRegisterTeam(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const team = data.team;
    const players = data.players;
    
    // Validate team data
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
    
    // Validate players
    if (!players || players.length < 2) {
      return { success: false, message: 'Minimal 2 pemain harus didaftarkan' };
    }
    
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.nama_pemain || !p.nama_pemain.trim()) {
        return { success: false, message: `Nama pemain ke-${i+1} wajib diisi` };
      }
      if (!['PRIA', 'WANITA'].includes(p.jenis_kelamin)) {
        return { success: false, message: `Jenis kelamin pemain ke-${i+1} tidak valid` };
      }
      if (!['KIRI', 'KANAN', 'KIRI_KANAN'].includes(p.posisi)) {
        return { success: false, message: `Posisi pemain ke-${i+1} tidak valid` };
      }
      if (!['REGULER', 'UNGGULAN'].includes(p.status_pemain)) {
        return { success: false, message: `Status pemain ke-${i+1} tidak valid` };
      }
    }
    
    // Check duplicate team name
    const regSheet = getSheet('REGISTRATIONS');
    const regData = regSheet.getDataRange().getValues();
    for (let i = 1; i < regData.length; i++) {
      if (regData[i][2] && regData[i][2].toLowerCase() === team.nama_tim.trim().toLowerCase()) {
        return { success: false, message: 'Nama tim sudah terdaftar. Gunakan nama lain.' };
      }
    }
    
    // Generate registration ID and number
    const registrationId = Utilities.getUuid();
    const nomorRegistrasi = generateNomorRegistrasi(regData);
    const now = new Date();
    const tanggalPendaftaran = Utilities.formatDate(now, 'Asia/Jayapura', 'yyyy-MM-dd HH:mm:ss');
    
    // Save registration
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
    
    // Save players
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

function handleUploadFile(data) {
  try {
    const { fileName, fileType, fileData, folder } = data;
    
    if (!fileData) {
      return { success: false, message: 'Data file kosong' };
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
    }
    
    // Save file
    const file = targetFolder.createFile(blob);
    
    // Set sharing - viewable by anyone with link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    const fileUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    return {
      success: true,
      message: 'File berhasil diunggah',
      data: { fileId, fileUrl }
    };
  } catch(error) {
    return { success: false, message: 'Gagal mengunggah file: ' + error.toString() };
  }
}

function handleCheckStatus(nomorRegistrasi) {
  if (!nomorRegistrasi) {
    return { success: false, message: 'Nomor registrasi wajib diisi' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  const headers = regData[0];
  
  let registration = null;
  let rowIndex = -1;
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][1] === nomorRegistrasi.trim()) {
      registration = rowToObject(headers, regData[i]);
      rowIndex = i;
      break;
    }
  }
  
  if (!registration) {
    return { success: false, message: 'Nomor registrasi tidak ditemukan' };
  }
  
  // Get players
  registration.players = getPlayersByRegistrationId(registration.registration_id);
  
  return { success: true, data: registration };
}

function handleGetRegistration(registrationId) {
  if (!registrationId) {
    return { success: false, message: 'ID pendaftaran tidak valid' };
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
    return { success: false, message: 'Data pendaftaran tidak ditemukan' };
  }
  
  registration.players = getPlayersByRegistrationId(registration.registration_id);
  
  return { success: true, data: registration };
}

function handleAdminLogin(data) {
  const { username, password } = data;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Utilities.getUuid();
    const cache = CacheService.getScriptCache();
    cache.put('admin_token_' + token, 'valid', SESSION_DURATION_HOURS * 3600);
    return { success: true, data: { token } };
  }
  
  return { success: false, message: 'Username atau password salah' };
}

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
  
  return { success: true, data: registrations };
}

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
      regSheet.getRange(i + 1, 10).setValue(status); // status column
      regSheet.getRange(i + 1, 11).setValue(catatan || ''); // catatan column
      regSheet.getRange(i + 1, 13).setValue(now); // updated_at column
      return { success: true, message: 'Status berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

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
      return { success: true, message: 'Data tim berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

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
      return { success: true, message: 'Data pemain berhasil diperbarui' };
    }
  }
  
  return { success: false, message: 'Pemain tidak ditemukan' };
}

function handleAdminAddPlayer(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  // Get registration to find team info
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  let registration = null;
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === data.registration_id) {
      registration = { nomor_registrasi: regData[i][1], nama_tim: regData[i][2] };
      break;
    }
  }
  
  if (!registration) {
    return { success: false, message: 'Pendaftaran tidak ditemukan' };
  }
  
  // Count existing players
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
  
  return { success: true, message: 'Pemain berhasil ditambahkan', data: { player_registration_id: playerRegId } };
}

function handleAdminDeletePlayer(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  
  for (let i = 1; i < playerData.length; i++) {
    if (playerData[i][0] === data.player_registration_id) {
      playerSheet.deleteRow(i + 1);
      return { success: true, message: 'Pemain berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Pemain tidak ditemukan' };
}

function handleAdminDeleteRegistration(data) {
  if (!validateAdminToken(data.token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  // Delete players first
  const playerSheet = getSheet('PLAYERS');
  const playerData = playerSheet.getDataRange().getValues();
  
  // Delete from bottom to top to maintain row indices
  for (let i = playerData.length - 1; i >= 1; i--) {
    if (playerData[i][1] === data.registration_id) {
      playerSheet.deleteRow(i + 1);
    }
  }
  
  // Delete registration
  const regSheet = getSheet('REGISTRATIONS');
  const regData = regSheet.getDataRange().getValues();
  
  for (let i = 1; i < regData.length; i++) {
    if (regData[i][0] === data.registration_id) {
      regSheet.deleteRow(i + 1);
      return { success: true, message: 'Pendaftaran berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Pendaftaran tidak ditemukan' };
}

function handleAdminExportCSV(token) {
  if (!validateAdminToken(token)) {
    return { success: false, message: 'Sesi tidak valid' };
  }
  
  const regSheet = getSheet('REGISTRATIONS');
  const playerSheet = getSheet('PLAYERS');
  const regData = regSheet.getDataRange().getValues();
  const playerData = playerSheet.getDataRange().getValues();
  
  // Build CSV - each player as separate row
  let csv = 'Nomor Registrasi,Nama Tim,Manajer,WhatsApp,Email,Asal Tim,Status,Tanggal,Nama Pemain,Jenis Kelamin,Posisi,Status Pemain\n';
  
  for (let i = 1; i < playerData.length; i++) {
    const p = playerData[i];
    // Find matching registration
    let reg = null;
    for (let j = 1; j < regData.length; j++) {
      if (regData[j][0] === p[1]) {
        reg = regData[j];
        break;
      }
    }
    if (reg) {
      csv += `"${reg[1]}","${reg[2]}","${reg[3]}","${reg[4]}","${reg[5]}","${reg[6]}","${reg[9]}","${reg[11]}","${p[5]}","${p[6]}","${p[7]}","${p[8]}"\n`;
    }
  }
  
  // Save CSV to Drive
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(csv, 'text/csv', `SOQ_Export_${new Date().toISOString().split('T')[0]}.csv`);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    success: true,
    data: { csvUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}` }
  };
}

// ============ HELPER FUNCTIONS ============

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Initialize headers based on sheet name
    if (name === 'REGISTRATIONS') {
      sheet.appendRow([
        'registration_id', 'nomor_registrasi', 'nama_tim', 'nama_manajer',
        'nomor_whatsapp', 'email_manajer', 'asal_tim', 'logo_file_id',
        'logo_file_url', 'status_pendaftaran', 'catatan_admin',
        'tanggal_pendaftaran', 'updated_at'
      ]);
    } else if (name === 'PLAYERS') {
      sheet.appendRow([
        'player_registration_id', 'registration_id', 'nomor_registrasi',
        'nama_tim', 'nomor_urut_pemain', 'nama_pemain', 'jenis_kelamin',
        'posisi', 'status_pemain', 'photo_file_id', 'photo_file_url',
        'created_at', 'updated_at'
      ]);
    } else if (name === 'SETTINGS') {
      sheet.appendRow(['key', 'value']);
      sheet.appendRow(['nama_kompetisi', 'SOQ.COMM PADEL LEAGUE']);
      sheet.appendRow(['tahun_kompetisi', '2026']);
      sheet.appendRow(['batas_minimum_pemain', '2']);
      sheet.appendRow(['batas_maksimum_pemain', '20']);
      sheet.appendRow(['batas_ukuran_logo', '2097152']);
      sheet.appendRow(['batas_ukuran_foto', '2097152']);
    }
  }
  
  return sheet;
}

function rowToObject(headers, row) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i] || '';
  }
  return obj;
}

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
  
  // Sort by nomor_urut
  players.sort((a, b) => (a.nomor_urut_pemain || 0) - (b.nomor_urut_pemain || 0));
  
  return players;
}

function generateNomorRegistrasi(existingData) {
  const year = new Date().getFullYear();
  let maxNum = 0;
  
  for (let i = 1; i < existingData.length; i++) {
    const nomor = existingData[i][1]; // nomor_registrasi column
    if (nomor && nomor.includes(`SOQ-REG-${year}-`)) {
      const num = parseInt(nomor.split('-').pop());
      if (num > maxNum) maxNum = num;
    }
  }
  
  const nextNum = (maxNum + 1).toString().padStart(4, '0');
  return `SOQ-REG-${year}-${nextNum}`;
}

function validateAdminToken(token) {
  if (!token) return false;
  const cache = CacheService.getScriptCache();
  const cached = cache.get('admin_token_' + token);
  return cached === 'valid';
}

// ============ SETUP FUNCTION ============
// Run this once to initialize the spreadsheet structure

function setupSpreadsheet() {
  getSheet('REGISTRATIONS');
  getSheet('PLAYERS');
  getSheet('SETTINGS');
  Logger.log('Setup complete! Spreadsheet structure created.');
}
