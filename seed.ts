import prisma from "./src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hash,
    },
    create: {
      username: "admin",
      email: "admin@yapki.sch.id",
      nama_lengkap: "Administrator YAPKI",
      password: hash,
      role: "admin",
    },
  });

  const hashGuru = await bcrypt.hash("guru123", 10);
  await prisma.user.upsert({
    where: { username: "guru" },
    update: {
      password: hashGuru,
    },
    create: {
      username: "guru",
      email: "guru@yapki.sch.id",
      nama_lengkap: "Guru Dummy Mapel",
      password: hashGuru,
      role: "guru_mapel",
    },
  });

  const hashPiket = await bcrypt.hash("piket123", 10);
  await prisma.user.upsert({
    where: { username: "piket" },
    update: {
      password: hashPiket,
    },
    create: {
      username: "piket",
      email: "piket@yapki.sch.id",
      nama_lengkap: "Guru Piket Utama",
      password: hashPiket,
      role: "guru_piket",
    },
  });

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
