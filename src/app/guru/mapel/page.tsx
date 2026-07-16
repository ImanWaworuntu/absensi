"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Camera, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { submitPresensiMapel } from "@/actions/presensi";

export default function GuruMapelPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
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
    if (!photo || !location) return;
    
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
        guruId: "guru-mapel-01", // Hardcode for now
        namaLengkap: "Budi Santoso, S.Pd",
        fotoBase64: photo,
        latitude: location.lat,
        longitude: location.lng,
        ipAddress,
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
    <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Submit Button */}
        <button
          onClick={submitAbsen}
          disabled={!photo || !location || isPending}
          className="w-full py-4 bg-primary text-white font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isPending ? "Mengirim..." : "Kirim Absen Sekarang"}
        </button>
      </div>
    </div>
  );
}
