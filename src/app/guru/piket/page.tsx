"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, MapPin, CheckCircle2, User } from "lucide-react";

export default function GuruPiketPage() {
  const [mode, setMode] = useState<"self" | "other">("self");
  const [selectedGuru, setSelectedGuru] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize Camera (Environment/Back facing for "other", user/front for "self")
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
  }, [mode]);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        {mode === "other" && (
          <div className="mb-6">
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
                <option value="1">Budi Santoso, S.Pd</option>
                <option value="2">Siti Aminah, M.Pd</option>
              </select>
            </div>
          </div>
        )}

        <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-6">
          {!photo ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={photo} alt="Photo" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {!photo && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button onClick={takePhoto} className="w-16 h-16 bg-white/20 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center hover:bg-white/40">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>

        <button
          disabled={!photo || (mode === "other" && !selectedGuru)}
          className={`w-full py-4 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            mode === "other" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : "bg-primary hover:bg-primary-dark shadow-primary/20"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          Kirim Absen
        </button>
      </div>
    </div>
  );
}
