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

export async function getPresensi() {
  await verifyAdmin();
  return prisma.presensiMapel.findMany({
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
