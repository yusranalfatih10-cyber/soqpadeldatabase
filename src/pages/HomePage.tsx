import { Link } from 'react-router-dom';
import { LOGO_URL, CONFIG } from '../config';
import { Users, ClipboardCheck, Search, Trophy, ArrowRight, Shield, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-sky-500 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(132,204,22,0.1) 0%, transparent 40%)`,
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm p-1 shadow-2xl border border-white/30">
                <img
                  src={LOGO_URL}
                  alt="SOQ.COMM Padel League"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              PENDAFTARAN TIM DAN PEMAIN
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-100 mb-3">
              {CONFIG.COMPETITION_NAME}
            </h2>
            <p className="text-lg text-white/80 mb-2">
              {CONFIG.REGION} • {CONFIG.COMPETITION_YEAR}
            </p>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto mb-10">
              Sistem pendaftaran resmi untuk pendataan tim dan pemain. 
              Lengkapi formulir pendaftaran untuk berpartisipasi dalam kompetisi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/daftar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-0.5 text-base"
              >
                <ClipboardCheck size={20} />
                DAFTAR SEKARANG
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/cek-status"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-all text-base"
              >
                <Search size={20} />
                CEK STATUS PENDAFTARAN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Tahapan Pendaftaran</h3>
          <p className="text-gray-600">Ikuti langkah-langkah berikut untuk mendaftarkan tim Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StepCard
            number={1}
            icon={<Users size={28} />}
            title="Isi Data Tim"
            description="Lengkapi informasi tim, manajer, dan unggah logo tim Anda."
            color="teal"
          />
          <StepCard
            number={2}
            icon={<ClipboardCheck size={28} />}
            title="Input Data Pemain"
            description="Tambahkan pemain satu per satu dengan foto dan data lengkap."
            color="sky"
          />
          <StepCard
            number={3}
            icon={<Shield size={28} />}
            title="Tinjau & Kirim"
            description="Periksa kembali seluruh data sebelum mengirim pendaftaran."
            color="lime"
          />
          <StepCard
            number={4}
            icon={<Trophy size={28} />}
            title="Terima Nomor Registrasi"
            description="Dapatkan nomor registrasi dan pantau status pendaftaran Anda."
            color="coral"
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white/60 border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              icon={<Users size={24} />}
              title="Data Pemain Individual"
              description="Setiap pemain didaftarkan secara individual dengan data lengkap termasuk foto, posisi bermain, dan status pemain."
            />
            <InfoCard
              icon={<MapPin size={24} />}
              title="Papua Barat Daya"
              description="Kompetisi padel resmi untuk wilayah Provinsi Papua Barat Daya. Terbuka untuk seluruh tim dan klub di wilayah ini."
            />
            <InfoCard
              icon={<Shield size={24} />}
              title="Data Tersimpan Aman"
              description="Seluruh data tersimpan secara permanen di database terstruktur. Foto dan logo disimpan di cloud storage yang aman."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-teal-800 to-sky-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-teal-200 text-sm">
            © {CONFIG.COMPETITION_YEAR} {CONFIG.COMPETITION_NAME} • {CONFIG.REGION}
          </p>
          <p className="text-teal-300/60 text-xs mt-2">
            Sistem Pendaftaran Resmi Tim dan Pemain
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description, color }: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    teal: 'from-teal-400 to-teal-600',
    sky: 'from-sky-400 to-sky-600',
    lime: 'from-lime-400 to-lime-600',
    coral: 'from-orange-400 to-rose-500',
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
        {number}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function InfoCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
