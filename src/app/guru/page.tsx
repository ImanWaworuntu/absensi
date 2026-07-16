import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";

export default function GuruRoleSelection() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
        <p className="text-gray-500 mb-8">Silakan pilih peran Anda untuk sesi ini:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/guru/mapel" className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Guru Mapel</h2>
              <p className="text-xs text-gray-500 mt-1">Mengisi presensi mengajar kelas</p>
            </div>
          </Link>

          <Link href="/guru/piket" className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Guru Piket</h2>
              <p className="text-xs text-gray-500 mt-1">Mengisi presensi piket harian</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
