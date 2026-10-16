import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import PreviewPage from './pages/PreviewPage';
import ConfirmationPage from './pages/ConfirmationPage';
import StatusPage from './pages/StatusPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDetailPage from './pages/AdminDetailPage';
import DeployGuide from './pages/DeployGuide';
import Header from './components/Header';
import ConfigNotice from './components/ConfigNotice';
import type { TeamData, PlayerData } from './types';

interface AppContextType {
  teamData: TeamData;
  setTeamData: (data: TeamData) => void;
  players: PlayerData[];
  setPlayers: (players: PlayerData[]) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  registrationResult: any;
  setRegistrationResult: (result: any) => void;
}

export const AppContext = createContext<AppContextType>({
  teamData: { nama_tim: '', nama_manajer: '', nomor_whatsapp: '', email_manajer: '', asal_tim: '' },
  setTeamData: () => {},
  players: [],
  setPlayers: () => {},
  adminToken: null,
  setAdminToken: () => {},
  registrationResult: null,
  setRegistrationResult: () => {},
});

export const useAppContext = () => useContext(AppContext);

export default function App() {
  const [teamData, setTeamData] = useState<TeamData>({
    nama_tim: '',
    nama_manajer: '',
    nomor_whatsapp: '',
    email_manajer: '',
    asal_tim: '',
  });
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(
    sessionStorage.getItem('soq_admin_session')
  );
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  return (
    <AppContext.Provider
      value={{
        teamData,
        setTeamData,
        players,
        setPlayers,
        adminToken,
        setAdminToken: (token) => {
          setAdminToken(token);
          if (token) {
            sessionStorage.setItem('soq_admin_session', token);
          } else {
            sessionStorage.removeItem('soq_admin_session');
          }
        },
        registrationResult,
        setRegistrationResult,
      }}
    >
      <HashRouter>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-sky-50">
          <Header />
          <ConfigNotice />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daftar" element={<RegistrationPage />} />
            <Route path="/pratinjau" element={<PreviewPage />} />
            <Route path="/konfirmasi" element={<ConfirmationPage />} />
            <Route path="/cek-status" element={<StatusPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/detail/:id" element={<AdminDetailPage />} />
            <Route path="/panduan-deploy" element={<DeployGuide />} />
          </Routes>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}
