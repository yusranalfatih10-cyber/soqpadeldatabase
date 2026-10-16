import { CONFIG } from './config';
import type { Registration, PlayerData, TeamData, ApiResponse, AppSettings } from './types';

const GAS_URL = CONFIG.GAS_URL;

async function callGAS(action: string, payload: Record<string, any> = {}): Promise<ApiResponse> {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('API call failed:', error);
    return {
      success: false,
      message: 'Koneksi ke server gagal. Pastikan koneksi internet Anda stabil.',
      error: error.message,
    };
  }
}

async function callGASGet(action: string, params: Record<string, string> = {}): Promise<ApiResponse> {
  try {
    const url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('API GET failed:', error);
    return {
      success: false,
      message: 'Koneksi ke server gagal. Pastikan koneksi internet Anda stabil.',
      error: error.message,
    };
  }
}

// Get app settings
export async function getSettings(): Promise<ApiResponse<AppSettings>> {
  return callGASGet('getSettings');
}

// Register new team
export async function registerTeam(teamData: TeamData, players: PlayerData[]): Promise<ApiResponse<Registration>> {
  // First upload logo if present
  let logoFileId = '';
  let logoFileUrl = '';
  
  if (teamData.logo_file) {
    const logoResult = await uploadFile(teamData.logo_file, 'logo_tim');
    if (!logoResult.success) {
      return { success: false, message: 'Gagal mengunggah logo tim: ' + logoResult.message };
    }
    logoFileId = logoResult.data?.fileId || '';
    logoFileUrl = logoResult.data?.fileUrl || '';
  }
  
  // Upload player photos
  const playerPhotos: Array<{ playerId: string; fileId: string; fileUrl: string }> = [];
  for (const player of players) {
    if (player.photo_file) {
      const photoResult = await uploadFile(player.photo_file, 'foto_pemain');
      if (!photoResult.success) {
        return { success: false, message: `Gagal mengunggah foto ${player.nama_pemain}: ${photoResult.message}` };
      }
      playerPhotos.push({
        playerId: player.id,
        fileId: photoResult.data?.fileId || '',
        fileUrl: photoResult.data?.fileUrl || '',
      });
    }
  }
  
  // Submit registration
  const payload = {
    team: {
      nama_tim: teamData.nama_tim,
      nama_manajer: teamData.nama_manajer,
      nomor_whatsapp: teamData.nomor_whatsapp,
      email_manajer: teamData.email_manajer,
      asal_tim: teamData.asal_tim,
      logo_file_id: logoFileId,
      logo_file_url: logoFileUrl,
    },
    players: players.map((p, idx) => ({
      nama_pemain: p.nama_pemain,
      jenis_kelamin: p.jenis_kelamin,
      posisi: p.posisi,
      status_pemain: p.status_pemain,
      nomor_urut: idx + 1,
      photo_file_id: playerPhotos.find(pp => pp.playerId === p.id)?.fileId || '',
      photo_file_url: playerPhotos.find(pp => pp.playerId === p.id)?.fileUrl || '',
    })),
  };
  
  return callGAS('registerTeam', payload);
}

// Upload file to Google Drive
export async function uploadFile(file: File, folder: string): Promise<ApiResponse<{ fileId: string; fileUrl: string }>> {
  try {
    const base64 = await fileToBase64(file);
    
    const result = await callGAS('uploadFile', {
      fileName: file.name,
      fileType: file.type,
      fileData: base64,
      folder: folder,
    });
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal mengunggah file: ' + error.message,
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Check registration status
export async function checkStatus(nomorRegistrasi: string): Promise<ApiResponse<Registration>> {
  return callGASGet('checkStatus', { nomor_registrasi: nomorRegistrasi });
}

// Get registration by ID
export async function getRegistration(registrationId: string): Promise<ApiResponse<Registration>> {
  return callGASGet('getRegistration', { registration_id: registrationId });
}

// Admin login
export async function adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
  return callGAS('adminLogin', { username, password });
}

// Admin: Get all registrations
export async function adminGetAllRegistrations(token: string): Promise<ApiResponse<Registration[]>> {
  return callGASGet('adminGetAll', { token });
}

// Admin: Update registration status
export async function adminUpdateStatus(
  token: string,
  registrationId: string,
  status: string,
  catatan: string
): Promise<ApiResponse> {
  return callGAS('adminUpdateStatus', { token, registration_id: registrationId, status, catatan });
}

// Admin: Update team data
export async function adminUpdateTeam(
  token: string,
  registrationId: string,
  teamData: Partial<TeamData>
): Promise<ApiResponse> {
  return callGAS('adminUpdateTeam', { token, registration_id: registrationId, ...teamData });
}

// Admin: Update player data
export async function adminUpdatePlayer(
  token: string,
  playerRegistrationId: string,
  playerData: Partial<PlayerData>
): Promise<ApiResponse> {
  return callGAS('adminUpdatePlayer', { token, player_registration_id: playerRegistrationId, ...playerData });
}

// Admin: Add player to registration
export async function adminAddPlayer(
  token: string,
  registrationId: string,
  playerData: Partial<PlayerData>
): Promise<ApiResponse> {
  return callGAS('adminAddPlayer', { token, registration_id: registrationId, ...playerData });
}

// Admin: Delete player
export async function adminDeletePlayer(
  token: string,
  playerRegistrationId: string
): Promise<ApiResponse> {
  return callGAS('adminDeletePlayer', { token, player_registration_id: playerRegistrationId });
}

// Admin: Delete registration
export async function adminDeleteRegistration(
  token: string,
  registrationId: string
): Promise<ApiResponse> {
  return callGAS('adminDeleteRegistration', { token, registration_id: registrationId });
}

// Admin: Export data as CSV
export async function adminExportCSV(token: string): Promise<ApiResponse<{ csvUrl: string }>> {
  return callGASGet('adminExportCSV', { token });
}
