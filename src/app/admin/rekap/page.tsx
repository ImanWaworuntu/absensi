"use client";

import { useState, useEffect } from "react";
import { Loader2, Edit2, Download } from "lucide-react";
import { getPresensi, updateStatusPresensi } from "./actions";
import * as XLSX from "xlsx";

export default function AdminRekapPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editMode, setEditMode] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("hadir");
  
  // Tanggal default (1 minggu terakhir)
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 7);
  
  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getPresensi(startDate, endDate);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const handleSaveStatus = async (id: number) => {
    try {
      await updateStatusPresensi(id, newStatus);
      setEditMode(null);
      loadData();
    } catch (e) {
      alert("Gagal menyimpan");
    }
  };

  const handleExportExcel = () => {
    if (data.length === 0) return alert("Tidak ada data untuk diekspor");
    
    // Prepare data for export
    const exportData = data.map((p) => ({
      "Tanggal": new Date(p.tanggal).toLocaleDateString("id-ID"),
      "Nama Guru": p.guru.nama_lengkap,
      "Jam Ke": p.jam_ke.join(", "),
      "Status Kehadiran": p.status_kehadiran.toUpperCase(),
      "Diabsen Oleh": p.piket ? p.piket.nama_lengkap : "Diri Sendiri"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kehadiran");
    XLSX.writeFile(workbook, `Rekap_Absensi_YAPKI_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rekap Kehadiran (Mapel)</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm outline-none text-gray-700 bg-transparent"
            />
            <span className="text-gray-400 text-sm">s/d</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm outline-none text-gray-700 bg-transparent"
            />
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Unduh Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Nama Guru</th>
                  <th className="px-6 py-4">Jam Ke</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Oleh Piket?</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data di rentang tanggal ini.
                    </td>
                  </tr>
                ) : (
                  data.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {new Date(p.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4">{p.guru.nama_lengkap}</td>
                      <td className="px-6 py-4">{p.jam_ke.join(", ")}</td>
                      <td className="px-6 py-4">
                        {editMode === p.id ? (
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="hadir">Hadir</option>
                            <option value="sakit">Sakit</option>
                            <option value="izin">Izin</option>
                            <option value="alfa">Alfa</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${
                            p.status_kehadiran === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                            p.status_kehadiran === 'sakit' ? 'bg-amber-100 text-amber-700' :
                            p.status_kehadiran === 'izin' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.status_kehadiran}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {p.piket ? p.piket.nama_lengkap : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editMode === p.id ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditMode(null)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Batal</button>
                            <button onClick={() => handleSaveStatus(p.id)} className="text-xs text-primary hover:text-primary-dark font-medium">Simpan</button>
                          </div>
                        ) : (
                          <button onClick={() => {setEditMode(p.id); setNewStatus(p.status_kehadiran);}} className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-primary/5">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
