"use client";

import { useState, useEffect } from "react";
import { Loader2, Edit2, Search } from "lucide-react";
import { getPresensi, updateStatusPresensi } from "./actions";

export default function AdminRekapPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editMode, setEditMode] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("hadir");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getPresensi();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStatus = async (id: number) => {
    try {
      await updateStatusPresensi(id, newStatus);
      setEditMode(null);
      loadData();
    } catch (e) {
      alert("Gagal menyimpan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rekap Kehadiran (Mapel)</h1>
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
                {data.map((p) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
