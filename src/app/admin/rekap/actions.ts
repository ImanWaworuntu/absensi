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
  if (filter === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateFilter = { gte: d };
  } else if (filter === "month") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
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
