"use server";

import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Fungsi bantuan untuk membuat user dummy (guru) jika belum ada
// karena kita menggunakan login statis untuk sementara
async function ensureGuruExists(guruId: string, namaLengkap: string) {
  const existing = await prisma.user.findUnique({ where: { id: guruId } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: guruId,
        username: guruId,
        email: `${guruId}@yapki.sch.id`,
        nama_lengkap: namaLengkap,
        role: "guru_dual", // default untuk testing
      },
    });
  }
}

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
  guruId: string;
  namaLengkap: string;
  fotoBase64: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
  diabsenkanOlehPiketId?: string;
}) {
  try {
    await ensureGuruExists(data.guruId, data.namaLengkap);

    // Jika piket yang absenkan, pastikan akun piket ada
    if (data.diabsenkanOlehPiketId) {
      await ensureGuruExists(data.diabsenkanOlehPiketId, "Guru Piket");
    }

    const fileName = `mapel/${data.guruId}_${Date.now()}.jpg`;
    const fotoUrl = await uploadBase64Image(data.fotoBase64, fileName);

    await prisma.presensiMapel.create({
      data: {
        guru_id: data.guruId,
        tanggal: new Date(),
        jam_absen: new Date(),
        foto_url: fotoUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        ip_address: data.ipAddress,
        status_kehadiran: "hadir",
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
  guruId: string;
  namaLengkap: string;
  fotoBase64: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
}) {
  try {
    await ensureGuruExists(data.guruId, data.namaLengkap);

    const fileName = `piket/${data.guruId}_${Date.now()}.jpg`;
    const fotoUrl = await uploadBase64Image(data.fotoBase64, fileName);

    // Cek apakah hari ini sudah absen piket
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const existingPiket = await prisma.presensiPiket.findFirst({
      where: {
        guru_id: data.guruId,
        tanggal: { gte: hariIni },
      },
    });

    if (existingPiket && !existingPiket.jam_pulang) {
      // Jika sudah absen datang, berarti ini absen pulang
      await prisma.presensiPiket.update({
        where: { id: existingPiket.id },
        data: {
          jam_pulang: new Date(),
          foto_pulang_url: fotoUrl,
        },
      });
      revalidatePath("/dashboard");
      return { success: true, message: "Berhasil menyimpan absensi PULANG Piket!" };
    } else if (!existingPiket) {
      // Absen Datang
      await prisma.presensiPiket.create({
        data: {
          guru_id: data.guruId,
          tanggal: new Date(),
          jam_datang: new Date(),
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
