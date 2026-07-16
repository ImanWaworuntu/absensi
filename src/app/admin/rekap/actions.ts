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

export async function getPresensi(startDate?: string, endDate?: string) {
  await verifyAdmin();
  
  let dateFilter: any = {};
  
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    dateFilter.gte = start;
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  return prisma.presensiMapel.findMany({
    where: Object.keys(dateFilter).length > 0 ? { tanggal: dateFilter } : undefined,
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
