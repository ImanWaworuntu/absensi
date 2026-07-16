"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { getGurus, createGuru, deleteGuru } from "./actions";

export default function AdminGuruPage() {
  const [gurus, setGurus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    nama_lengkap: "",
    email: "",
    password: "",
    role: "guru_mapel"
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getGurus();
      setGurus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGuru(formData);
      setShowModal(false);
      setFormData({ username: "", nama_lengkap: "", email: "", password: "", role: "guru_mapel" });
      loadData();
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus guru ini?")) return;
    try {
      await deleteGuru(id);
      loadData();
    } catch (e: any) {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Guru</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {gurus.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{g.nama_lengkap}</td>
                  <td className="px-6 py-4">{g.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${g.role === 'guru_piket' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {g.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Tambah Guru Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username (untuk login)</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peran (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="guru_mapel">Guru Mapel</option>
                  <option value="guru_piket">Guru Piket</option>
                  <option value="guru_dual">Guru Mapel & Piket</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
