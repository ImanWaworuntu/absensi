"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { StatusKehadiran } from "@prisma/client";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function getPresensi(filter: "all" | "week" | "month" = "all") {
  await verifyAdmin();
  
  let dateFilter = {};
  const now = new Date();
  
  if (filter === "week") {
    // Hari Senin di minggu ini
    const d = new Date(now);
    const day = d.getDay() || 7; // Convert Sunday (0) to 7
    d.setDate(d.getDate() - day + 1); // Get Monday
    d.setHours(0, 0, 0, 0);
    dateFilter = { gte: d };
  } else if (filter === "month") {
    // Tanggal 1 di bulan ini
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    dateFilter = { gte: d };
  }

  return prisma.presensiMapel.findMany({
    where: filter !== "all" ? { tanggal: dateFilter } : undefined,
    orderBy: { tanggal: "desc" },
    include: {
      guru: { select: { nama_lengkap: true } },
      piket: { select: { nama_lengkap: true } },
    }
  });
}

export async function updateStatusPresensi(id: number, status: string) {
  await verifyAdmin();
  return prisma.presensiMapel.update({
    where: { id },
    data: {
      status_kehadiran: status as StatusKehadiran,
    }
  });
}
