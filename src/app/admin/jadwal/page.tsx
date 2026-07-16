"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import { getJadwalMengajar, getJadwalPiket, createJadwalMengajar, deleteJadwalMengajar, createJadwalPiket, deleteJadwalPiket } from "./actions";
import { getGurus } from "../guru/actions";

export default function AdminJadwalPage() {
  const [activeTab, setActiveTab] = useState<"mapel" | "piket">("mapel");
  const [jadwalMapel, setJadwalMapel] = useState<any[]>([]);
  const [jadwalPiket, setJadwalPiket] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guru_id: "",
    hari: "Senin",
    mata_pelajaran: "",
    kelas: "",
    jam_ke: "" // e.g. "1,2,3"
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jm, jp, g] = await Promise.all([
        getJadwalMengajar(),
        getJadwalPiket(),
        getGurus()
      ]);
      setJadwalMapel(jm);
      setJadwalPiket(jp);
      setGurus(g);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number, type: "mapel"|"piket") => {
    if(!confirm("Hapus jadwal ini?")) return;
    try {
      if(type === "mapel") await deleteJadwalMengajar(id);
      else await deleteJadwalPiket(id);
      loadData();
    } catch(e) {
      alert("Gagal menghapus jadwal");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === "mapel") {
        await createJadwalMengajar({
          guru_id: formData.guru_id,
          hari: formData.hari,
          mata_pelajaran: formData.mata_pelajaran,
          kelas: formData.kelas,
          jam_ke: formData.jam_ke.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n))
        });
      } else {
        await createJadwalPiket({
          guru_id: formData.guru_id,
          hari: formData.hari,
        });
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      alert("Gagal menambahkan jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Jadwal</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab("mapel")} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "mapel" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Jadwal Mapel</button>
        <button onClick={() => setActiveTab("piket")} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "piket" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Jadwal Piket</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "mapel" ? (
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Hari</th>
                    <th className="px-6 py-4">Guru</th>
                    <th className="px-6 py-4">Mata Pelajaran</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Jam Ke</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalMapel.map((j) => (
                    <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{j.hari}</td>
                      <td className="px-6 py-4">{j.guru.nama_lengkap}</td>
                      <td className="px-6 py-4">{j.mata_pelajaran}</td>
                      <td className="px-6 py-4">{j.kelas}</td>
                      <td className="px-6 py-4">{j.jam_ke.join(", ")}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(j.id, "mapel")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Hari</th>
                    <th className="px-6 py-4">Guru Piket</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalPiket.map((j) => (
                    <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{j.hari}</td>
                      <td className="px-6 py-4">{j.guru.nama_lengkap}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(j.id, "piket")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Tambah Jadwal {activeTab === "mapel" ? "Mapel" : "Piket"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Guru</label>
                <select required value={formData.guru_id} onChange={e => setFormData({...formData, guru_id: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-gray-900">
                  <option value="">-- Pilih Guru --</option>
                  {gurus.map(g => (
                    <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Hari</label>
                <select value={formData.hari} onChange={e => setFormData({...formData, hari: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-gray-900">
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {activeTab === "mapel" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Mata Pelajaran</label>
                    <input required type="text" value={formData.mata_pelajaran} onChange={e => setFormData({...formData, mata_pelajaran: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Kelas</label>
                    <input required type="text" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Jam Ke (pisahkan dengan koma)</label>
                    <input required type="text" placeholder="1,2,3" value={formData.jam_ke} onChange={e => setFormData({...formData, jam_ke: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-gray-900" />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
