"use server";

import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getNowWITA, getAvailableSlots, isValidSlotForAttendance } from "@/lib/time";
import { StatusKehadiran } from "@prisma/client";

// Fungsi untuk upload gambar base64 ke Supabase Storage
async function uploadBase64Image(base64Data: string, path: string): Promise<string> {
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Content, "base64");
  
  const { data, error } = await supabase.storage
    .from("presensi") // pastikan bucket 'presensi' dibuat di Supabase
    .upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Gagal mengupload gambar ke Supabase:", error);
    throw new Error("Gagal mengunggah foto.");
  }

  // Dapatkan Public URL
  const { data: publicUrlData } = supabase.storage.from("presensi").getPublicUrl(path);
  return publicUrlData.publicUrl;
}

export async function submitPresensiMapel(data: {
  fotoBase64: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
  jam_ke: number[];
  diabsenkanOlehPiketId?: string;
  guruTargetId?: string; // Jika absen oleh piket
  status_kehadiran?: StatusKehadiran;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Anda belum login.");

    let guruId = session.id;
    
    // Jika diabsenkan oleh piket
    if (data.diabsenkanOlehPiketId && data.guruTargetId) {
      if (session.role !== "guru_piket" && session.role !== "admin") {
        throw new Error("Hanya guru piket atau admin yang bisa mengabsenkan orang lain.");
      }
      guruId = data.guruTargetId;
    }

    if (!data.jam_ke || data.jam_ke.length === 0) {
      throw new Error("Pilih setidaknya 1 jam pelajaran.");
    }

    // Validasi apakah slot valid (H-15 menit dan belum berlalu)
    for (const jam of data.jam_ke) {
      if (!isValidSlotForAttendance(jam)) {
        throw new Error(`Jam ke-${jam} belum tersedia atau sudah berlalu.`);
      }
    }

    const fileName = `mapel/${guruId}_${Date.now()}.jpg`;
    
    // Jika diabsenkan piket dan statusnya Izin/Sakit/Alpa, foto tidak wajib. Tapi jika absen mandiri, wajib.
    let fotoUrl = null;
    if (data.fotoBase64) {
      fotoUrl = await uploadBase64Image(data.fotoBase64, fileName);
    } else if (!data.diabsenkanOlehPiketId || data.status_kehadiran === "hadir") {
      throw new Error("Foto wajib dilampirkan untuk absensi hadir.");
    }

    const nowWita = getNowWITA();

    await prisma.presensiMapel.create({
      data: {
        guru_id: guruId,
        tanggal: nowWita,
        jam_absen: nowWita,
        jam_ke: data.jam_ke,
        foto_url: fotoUrl,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        ip_address: data.ipAddress || "127.0.0.1",
        status_kehadiran: data.status_kehadiran || "hadir",
        diabsenkan_oleh_piket_id: data.diabsenkanOlehPiketId || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Berhasil menyimpan absensi Mapel!" };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function submitPresensiPiket(data: {
  fotoBase64: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Anda belum login.");
    if (session.role !== "guru_piket" && session.role !== "admin") {
      throw new Error("Hanya guru piket yang dapat melakukan absen ini.");
    }

    const guruId = session.id;

    const fileName = `piket/${guruId}_${Date.now()}.jpg`;
    const fotoUrl = await uploadBase64Image(data.fotoBase64, fileName);

    const nowWita = getNowWITA();

    // Cek apakah hari ini sudah absen piket (bandingkan tanggal saja, abaikan jam)
    // Gunakan filter tanggal dengan cara yang benar
    const startOfDay = new Date(nowWita);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(nowWita);
    endOfDay.setHours(23, 59, 59, 999);

    const existingPiket = await prisma.presensiPiket.findFirst({
      where: {
        guru_id: guruId,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingPiket && !existingPiket.jam_pulang) {
      // Jika sudah absen datang, berarti ini absen pulang
      await prisma.presensiPiket.update({
        where: { id: existingPiket.id },
        data: {
          jam_pulang: nowWita,
          foto_pulang_url: fotoUrl,
        },
      });
      revalidatePath("/dashboard");
      return { success: true, message: "Berhasil menyimpan absensi PULANG Piket!" };
    } else if (!existingPiket) {
      // Absen Datang
      await prisma.presensiPiket.create({
        data: {
          guru_id: guruId,
          tanggal: nowWita,
          jam_datang: nowWita,
          foto_datang_url: fotoUrl,
          latitude_datang: data.latitude,
          longitude_datang: data.longitude,
          ip_address: data.ipAddress,
        },
      });
      revalidatePath("/dashboard");
      return { success: true, message: "Berhasil menyimpan absensi DATANG Piket!" };
    } else {
      return { success: false, message: "Anda sudah melakukan absen datang dan pulang hari ini." };
    }
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || "Terjadi kesalahan sistem." };
  }
}
