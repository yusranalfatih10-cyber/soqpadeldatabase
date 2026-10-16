// Configuration for SOQ.COMM PADEL LEAGUE Registration System
// Update GAS_URL after deploying Google Apps Script as Web App

export const CONFIG = {
  // Google Apps Script Web App URL
  // Replace this with your deployed Apps Script URL
  GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  
  // Logo URL
  LOGO_URL: 'https://wealthy-magenta-fymy1fwv.edgeone.dev/file.png',
  
  // Competition info
  COMPETITION_NAME: 'SOQ.COMM PADEL LEAGUE',
  COMPETITION_YEAR: '2026',
  REGION: 'Provinsi Papua Barat Daya',
  
  // File upload limits (in bytes)
  MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_PHOTO_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Player limits
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 20,
  
  // Admin credentials check (done on backend, not stored here)
  ADMIN_SESSION_KEY: 'soq_admin_session',
};

export const LOGO_URL = CONFIG.LOGO_URL;
