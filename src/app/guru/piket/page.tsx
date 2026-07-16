"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Camera, CheckCircle2, User, Loader2 } from "lucide-react";
import { submitPresensiPiket, submitPresensiMapel } from "@/actions/presensi";
import { getAvailableSlots } from "@/lib/time";
import { getAllGuru } from "@/actions/guru";
import { StatusKehadiran } from "@prisma/client";
import Link from "next/link";

export default function GuruPiketPage() {
  const [mode, setMode] = useState<"self" | "other">("self");
  const [gurus, setGurus] = useState<{id: string; nama_lengkap: string}[]>([]);
  const [selectedGuru, setSelectedGuru] = useState("");
  const [statusKehadiran, setStatusKehadiran] = useState<StatusKehadiran>("hadir");
  const [photo, setPhoto] = useState<string | null>(null);
  
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Ambil daftar guru
    getAllGuru().then(setGurus);

    const updateSlots = () => {
      const allSlots = getAvailableSlots();
      const visible = allSlots.filter(s => s.status === "available" || s.status === "upcoming").slice(0, 3);
      setSlots(visible);
    };

    updateSlots();
    const interval = setInterval(updateSlots, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize Camera (Environment/Back facing for "other", user/front for "self")
    if (mode === "other" && statusKehadiran !== "hadir") {
      // Tidak perlu kamera jika status izin/sakit/alpa
      return;
    }

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode === "self" ? "user" : "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode, statusKehadiran]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imgDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.7);
        setPhoto(imgDataUrl);
      }
    }
  };

  const submitAbsen = () => {
    if (mode === "self" && !photo) {
      setMessage("Silakan ambil foto terlebih dahulu.");
      return;
    }

    if (mode === "other") {
      if (!selectedGuru) {
        setMessage("Pilih guru mapel terlebih dahulu!");
        return;
      }
      if (selectedSlots.length === 0) {
        setMessage("Pilih setidaknya 1 jam pelajaran.");
        return;
      }
      if (statusKehadiran === "hadir" && !photo) {
        setMessage("Silakan ambil foto bukti kehadiran guru.");
        return;
      }
    }
    
    startTransition(async () => {
      setMessage("");
      let ipAddress = "127.0.0.1";
      try {
        const res = await fetch("/api/check-ip");
        const data = await res.json();
        ipAddress = data.ip || ipAddress;
      } catch (e) {
        console.warn("Could not fetch IP", e);
      }

      if (mode === "self") {
        const result = await submitPresensiPiket({
          fotoBase64: photo!,
          latitude: 0,
          longitude: 0,
          ipAddress,
        });
        setMessage(result.message);
      } else {
        const result = await submitPresensiMapel({
          fotoBase64: photo || "", // Kosongkan jika izin
          latitude: 0,
          longitude: 0,
          ipAddress,
          diabsenkanOlehPiketId: "dummy", // akan di set oleh backend berdasarkan session
          guruTargetId: selectedGuru,
          jam_ke: selectedSlots,
          status_kehadiran: statusKehadiran,
        });
        setMessage(result.message);
      }
      
      if (message.includes("Berhasil")) {
        setTimeout(() => window.location.href = "/guru", 2000);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Presensi Piket</h1>
        <Link 
          href="/guru" 
          className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
        >
          Ganti Peran
        </Link>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => { setMode("self"); setPhoto(null); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
            mode === "self" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Absen Diri Sendiri (Piket)
        </button>
        <button
          onClick={() => { setMode("other"); setPhoto(null); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
            mode === "other" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Absen Guru Lain
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        {message && (
          <div className={`p-4 mb-6 text-sm rounded-xl font-medium ${message.includes("Berhasil") ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {mode === "other" && (
          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Guru Mapel</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedGuru}
                  onChange={(e) => setSelectedGuru(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">-- Pilih Guru --</option>
                  {gurus.map(g => (
                    <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Jam Pelajaran</label>
              <div className="space-y-3">
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada jam pelajaran yang tersedia saat ini.</p>
                ) : (
                  slots.map((slot) => {
                    const isAvailable = slot.status === "available";
                    const isSelected = selectedSlots.includes(slot.id);
                    
                    const toggleSlot = () => {
                      if (!isAvailable) return;
                      if (isSelected) {
                        setSelectedSlots(prev => prev.filter(id => id !== slot.id));
                      } else {
                        setSelectedSlots(prev => [...prev, slot.id]);
                      }
                    };

                    return (
                      <label key={slot.id} onClick={toggleSlot} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${isAvailable ? (isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50') : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>{slot.label}</p>
                            <p className="text-xs text-gray-500">{slot.start} - {slot.end}</p>
                          </div>
                        </div>
                        {!isAvailable && (
                          <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">Belum Waktunya</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan Kehadiran</label>
              <div className="flex gap-2">
                {(["hadir", "sakit", "izin", "alfa"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusKehadiran(status);
                      if (status !== "hadir") setPhoto(null);
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl border ${statusKehadiran === status ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(mode === "self" || (mode === "other" && statusKehadiran === "hadir")) && (
          <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-6">
            {!photo ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={photo} alt="Photo" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              {!photo ? (
                <button onClick={takePhoto} className="w-16 h-16 bg-white/20 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center hover:bg-white/40">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              ) : (
                <button onClick={() => setPhoto(null)} className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-sm font-medium hover:bg-white transition-colors">
                  Ulangi Foto
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={submitAbsen}
          disabled={isPending || (mode === "self" && !photo) || (mode === "other" && (!selectedGuru || selectedSlots.length === 0 || (statusKehadiran === "hadir" && !photo)))}
          className={`w-full py-4 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            mode === "other" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : "bg-primary hover:bg-primary-dark shadow-primary/20"
          }`}
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isPending ? "Mengirim..." : (mode === "self" ? "Kirim Absen Piket" : "Kirim Absen Guru")}
        </button>
      </div>
    </div>
  );
}
