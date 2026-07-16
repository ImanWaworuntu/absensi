"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Clock, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Admin YAPKI</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/guru" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-gray-400" /> Data Guru
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/jadwal" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Calendar className="w-5 h-5 text-gray-400" /> Jadwal Mengajar
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/rekap" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Clock className="w-5 h-5 text-gray-400" /> Rekap Kehadiran
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden">
          <button onClick={toggleSidebar} className="p-2 mr-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Admin YAPKI</span>
        </header>
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
