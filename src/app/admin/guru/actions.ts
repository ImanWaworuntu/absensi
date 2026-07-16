"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { Role } from "@prisma/client";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function getGurus() {
  await verifyAdmin();
  return prisma.user.findMany({
    where: { role: { not: "admin" } },
    orderBy: { nama_lengkap: "asc" },
    select: { id: true, username: true, email: true, nama_lengkap: true, role: true }
  });
}

export async function createGuru(data: any) {
  await verifyAdmin();
  const hash = await bcrypt.hash(data.password, 10);
  
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hash,
      nama_lengkap: data.nama_lengkap,
      role: data.role as Role,
    }
  });
}

export async function deleteGuru(id: string) {
  await verifyAdmin();
  return prisma.user.delete({ where: { id } });
}
