"use server";

import prisma from "@/lib/db";

export async function getAllGuru() {
  const gurus = await prisma.user.findMany({
    where: {
      role: {
        in: ["guru_mapel", "guru_piket", "guru_dual"]
      }
    },
    select: {
      id: true,
      nama_lengkap: true,
    },
    orderBy: {
      nama_lengkap: "asc"
    }
  });

  return gurus;
}
