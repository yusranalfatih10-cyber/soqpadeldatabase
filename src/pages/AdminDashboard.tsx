import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { adminGetAllRegistrations, adminExportCSV } from '../api';
import { STATUS_PENDAFTARAN } from '../types';
import { 
  Users, ClipboardList, CheckCircle, AlertTriangle, XCircle, 
  Clock, Search, Filter, Download, LogOut, Eye, Loader,
  BarChart3, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminToken, setAdminToken } = useAppContext();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [adminToken]);

  const loadData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const result = await adminGetAllRegistrations(adminToken);
      if (result.success && result.data) {
        setRegistrations(result.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    navigate('/admin');
  };

  const handleExport = async () => {
    if (!adminToken) return;
    try {
      const result = await adminExportCSV(adminToken);
      if (result.success && result.data?.csvUrl) {
        window.open(result.data.csvUrl, '_blank');
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Statistics
  const stats = {
    total: registrations.length,
    menunggu: registrations.filter(r => r.status_pendaftaran === 'MENUNGGU_VERIFIKASI').length,
    disetujui: registrations.filter(r => r.status_pendaftaran === 'DISETUJUI').length,
    perluRevisi: registrations.filter(r => r.status_pendaftaran === 'PERLU_REVISI').length,
    ditolak: registrations.filter(r => r.status_pendaftaran === 'DITOLAK').length,
    totalPlayers: registrations.reduce((sum, r) => sum + (r.players?.length || 0), 0),
    totalReguler: registrations.reduce((sum, r) => sum + (r.players?.filter((p: any) => p.status_pemain === 'REGULER').length || 0), 0),
    totalUnggulan: registrations.reduce((sum, r) => sum + (r.players?.filter((p: any) => p.status_pemain === 'UNGGULAN').length || 0), 0),
  };

  // Filter & Search
  const filtered = registrations.filter(r => {
    const matchSearch = !searchTerm || 
      (r.nomor_registrasi || r.nomorRegistrasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.nama_tim || r.namaTim || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.nama_manajer || r.namaManajer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || r.status_pendaftaran === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Admin</h2>
          <p className="text-gray-600">Kelola pendaftaran tim dan pemain</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors" title="Refresh">
            <RefreshCw size={18} className="text-gray-600" />
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
            <Download size={16} /> Ekspor
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-700 transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        <StatCard icon={<ClipboardList size={18} />} label="Total" value={stats.total} color="teal" />
        <StatCard icon={<Clock size={18} />} label="Menunggu" value={stats.menunggu} color="yellow" />
        <StatCard icon={<CheckCircle size={18} />} label="Disetujui" value={stats.disetujui} color="green" />
        <StatCard icon={<AlertTriangle size={18} />} label="Revisi" value={stats.perluRevisi} color="orange" />
        <StatCard icon={<XCircle size={18} />} label="Ditolak" value={stats.ditolak} color="red" />
        <StatCard icon={<Users size={18} />} label="Tim" value={stats.total} color="sky" />
        <StatCard icon={<Users size={18} />} label="Pemain" value={stats.totalPlayers} color="indigo" />
        <StatCard icon={<BarChart3 size={18} />} label="Unggulan" value={stats.totalUnggulan} color="amber" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nomor registrasi, nama tim, atau manajer..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 outline-none appearance-none bg-white text-sm"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="PERLU_REVISI">Perlu Revisi</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader size={32} className="animate-spin text-teal-500 mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Belum ada data pendaftaran</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">No. Registrasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama Tim</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Manajer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">WhatsApp</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Pemain</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden sm:table-cell">Tanggal</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((reg) => {
                  const statusInfo = STATUS_PENDAFTARAN[reg.status_pendaftaran as keyof typeof STATUS_PENDAFTARAN];
                  return (
                    <tr key={reg.registration_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-medium text-teal-700">
                        {reg.nomor_registrasi || reg.nomorRegistrasi}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {reg.nama_tim || reg.namaTim}
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                        {reg.nama_manajer || reg.namaManajer}
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                        {reg.nomor_whatsapp || reg.nomorWhatsapp}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {reg.players?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden sm:table-cell text-xs">
                        {reg.tanggal_pendaftaran || reg.tanggalPendaftaran}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {statusInfo && (
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/admin/detail/${reg.registration_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                        >
                          <Eye size={14} /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      page === currentPage ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    sky: 'bg-sky-50 text-sky-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`rounded-xl p-3 ${colorMap[color]} border border-current/10`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
