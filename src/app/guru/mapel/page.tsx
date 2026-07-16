"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Camera, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { submitPresensiMapel } from "@/actions/presensi";
import { getAvailableSlots } from "@/lib/time";
import Link from "next/link";

export default function GuruMapelPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Get Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    }

    // Polling available slots
    const updateSlots = () => {
      const allSlots = getAvailableSlots();
      // "cuma 3 checkbox ( 3 jam mapel kedepan) yang terbuka"
      // Filter slots that are available or upcoming, and take the first 3
      const visible = allSlots.filter(s => s.status === "available" || s.status === "upcoming").slice(0, 3);
      setSlots(visible);
    };

    updateSlots();
    const interval = setInterval(updateSlots, 60000); // per menit

    // Initialize Camera (Front facing)
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
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
      // Cleanup camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(interval);
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Set canvas dimensions to video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Compress to JPEG with 0.7 quality to keep under 100KB
        const imgDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.7);
        setPhoto(imgDataUrl);
      }
    }
  };

  const submitAbsen = () => {
    if (!photo || !location || selectedSlots.length === 0) {
      setMessage("Pastikan lokasi, foto, dan setidaknya 1 jam pelajaran dipilih.");
      return;
    }
    
    startTransition(async () => {
      setMessage("");
      // Get IP
      let ipAddress = "127.0.0.1";
      try {
        const res = await fetch("/api/check-ip");
        const data = await res.json();
        ipAddress = data.ip || ipAddress;
      } catch (e) {
        console.warn("Could not fetch IP", e);
      }

      const result = await submitPresensiMapel({
        fotoBase64: photo,
        latitude: location.lat,
        longitude: location.lng,
        ipAddress,
        jam_ke: selectedSlots,
      });

      if (result.success) {
        setMessage(result.message);
        setTimeout(() => window.location.href = "/guru", 2000);
      } else {
        setMessage(result.message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Presensi Kelas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Silakan pilih jadwal yang akan diabsen
          </p>
        </div>
        <Link 
          href="/guru" 
          className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
        >
          Ganti Peran
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Absensi Guru Mapel</h1>
        <p className="text-sm text-gray-500 mb-6">Jadwal saat ini: Matematika - Kelas XA (07:00 - 08:30)</p>

        {message && (
          <div className={`p-4 mb-6 text-sm rounded-xl font-medium ${message.includes("Berhasil") ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Location Status */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-6">
          <div className={`p-2 rounded-xl ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Status Lokasi {isLocating ? "(Mencari...)" : ""}
            </p>
            <p className="text-xs text-gray-500">
              {location 
                ? `Terdeteksi di area sekolah (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` 
                : "Harap izinkan akses lokasi"}
            </p>
          </div>
        </div>

        {/* Pemilihan Jam Mengajar */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pilih Jam Pelajaran:</h3>
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

        {/* Camera Area */}
        <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-6">
          {!photo ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={photo} alt="Selfie" className="w-full h-full object-cover" />
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Overlay */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            {!photo ? (
              <button 
                onClick={takePhoto}
                className="w-16 h-16 bg-white/20 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            ) : (
              <button 
                onClick={() => setPhoto(null)}
                className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-sm font-medium hover:bg-white transition-colors"
              >
                Ulangi Foto
              </button>
            )}
          </div>
        </div>

        <button
          onClick={submitAbsen}
          disabled={!photo || !location || selectedSlots.length === 0 || isPending}
          className="w-full py-4 bg-primary text-white font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isPending ? "Mengirim..." : "Kirim Absen Sekarang"}
        </button>
      </div>
    </div>
  );
}
