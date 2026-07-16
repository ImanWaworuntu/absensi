"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Hari } from "@prisma/client";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

// GET DATA
export async function getJadwalMengajar() {
  await verifyAdmin();
  return prisma.jadwalMengajar.findMany({
    include: { guru: { select: { nama_lengkap: true } } },
    orderBy: [{ hari: "asc" }, { jam_ke: "asc" }]
  });
}

export async function getJadwalPiket() {
  await verifyAdmin();
  return prisma.jadwalPiket.findMany({
    include: { guru: { select: { nama_lengkap: true } } },
    orderBy: { hari: "asc" }
  });
}

// MASA DEPAN:
export async function createJadwalMengajar(data: any) {
  await verifyAdmin();
  return prisma.jadwalMengajar.create({ data });
}
export async function deleteJadwalMengajar(id: number) {
  await verifyAdmin();
  return prisma.jadwalMengajar.delete({ where: { id } });
}

export async function createJadwalPiket(data: any) {
  await verifyAdmin();
  return prisma.jadwalPiket.create({ data });
}
export async function deleteJadwalPiket(id: number) {
  await verifyAdmin();
  return prisma.jadwalPiket.delete({ where: { id } });
}
