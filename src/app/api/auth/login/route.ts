import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    let user = await prisma.user.findUnique({
      where: { username },
      include: {
        jadwal_piket: true,
      }
    });

    // AUTO SEED: Jika admin pertama kali login dan belum ada di DB
    if (!user && username === "admin" && password === "admin") {
      const hash = await bcrypt.hash("admin", 10);
      user = await prisma.user.create({
        data: {
          username: "admin",
          email: "admin@yapki.sch.id",
          nama_lengkap: "Administrator",
          password: hash,
          role: "admin",
        },
        include: { jadwal_piket: true }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Username tidak ditemukan" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }
    
    // Buat JWT
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 Hari
    const sessionData = {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role, // all teachers are guru_dual now
    };

    const session = await encrypt(sessionData);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    
    let redirectUrl = "";
    if (user.role === "admin") {
      redirectUrl = "/admin";
    } else {
      redirectUrl = "/guru";
    }

    return NextResponse.json({ success: true, redirectUrl, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
