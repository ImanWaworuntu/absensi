"use client";

import Link from "next/link";
import { Users, Calendar, Clock, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Admin YAPKI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/guru" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-gray-400" /> Data Guru
          </Link>
          <Link href="/admin/jadwal" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Calendar className="w-5 h-5 text-gray-400" /> Jadwal Mengajar
          </Link>
          <Link href="/admin/rekap" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Clock className="w-5 h-5 text-gray-400" /> Rekap Kehadiran
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Admin YAPKI</span>
        </header>
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
