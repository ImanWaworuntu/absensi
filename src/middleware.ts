import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Cek apakah user mengunjungi halaman login
  if (request.nextUrl.pathname === "/") {
    if (session) {
      try {
        const payload = await decrypt(session);
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (payload.role === "guru_mapel") {
          return NextResponse.redirect(new URL("/guru/mapel", request.url));
        } else if (payload.role === "guru_piket") {
          return NextResponse.redirect(new URL("/guru/piket", request.url));
        } else if (payload.role === "guru_dual") {
          return NextResponse.redirect(new URL("/guru", request.url));
        }
      } catch (err) {
        // Abaikan jika token tidak valid
      }
    }
    return NextResponse.next();
  }

  // Lindungi rute /admin dan /guru
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/guru")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const payload = await decrypt(session);

      // Proteksi Admin
      if (request.nextUrl.pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Proteksi Guru
      if (request.nextUrl.pathname.startsWith("/guru") && payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/guru/:path*"],
};
