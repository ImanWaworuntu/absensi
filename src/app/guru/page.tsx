import Link from "next/link";
import { BookOpen, UserCheck } from "lucide-react";

export default function GuruSelectionPage() {
  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, Budi Santoso</h1>
        <p className="text-gray-500 mt-2">Silakan pilih mode presensi Anda hari ini.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/guru/mapel" className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Guru Mapel</h2>
            <p className="text-gray-500">
              Masuk untuk melakukan absensi mandiri sebelum mengajar di kelas Anda.
            </p>
          </div>
        </Link>

        <Link href="/guru/piket" className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Guru Piket</h2>
            <p className="text-gray-500">
              Masuk untuk absensi piket Anda dan mengabsenkan guru mapel lain.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
