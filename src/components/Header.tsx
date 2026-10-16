import { Link, useLocation } from 'react-router-dom';
import { LOGO_URL, CONFIG } from '../config';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-teal-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-teal-400 to-sky-500 p-0.5 shadow-md group-hover:shadow-lg transition-shadow">
              <img
                src={LOGO_URL}
                alt="SOQ.COMM Padel League"
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d9488" width="100" height="100" rx="10"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SOQ</text></svg>';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-bold text-teal-800 leading-tight">
                {CONFIG.COMPETITION_NAME}
              </h1>
              <p className="text-xs text-teal-600">{CONFIG.REGION}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={location.pathname === '/'}>Beranda</NavLink>
            <NavLink to="/daftar" active={location.pathname === '/daftar'}>Daftar</NavLink>
            <NavLink to="/cek-status" active={location.pathname === '/cek-status'}>Cek Status</NavLink>
            {!isAdmin && (
              <NavLink to="/admin" active={location.pathname === '/admin'}>Admin</NavLink>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-teal-100 mt-2 pt-3">
            <div className="flex flex-col gap-1">
              <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Beranda</MobileNavLink>
              <MobileNavLink to="/daftar" onClick={() => setMobileMenuOpen(false)}>Daftar</MobileNavLink>
              <MobileNavLink to="/cek-status" onClick={() => setMobileMenuOpen(false)}>Cek Status</MobileNavLink>
              <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-teal-100 text-teal-800'
          : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
    >
      {children}
    </Link>
  );
}
