import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Dalam lingkungan produksi (Vercel dsb), IP biasanya ada di header x-forwarded-for
  const ip = request.headers.get("x-forwarded-for") || request.ip || "127.0.0.1";
  const gatewayIp = process.env.WIFI_GATEWAY_IP;

  if (gatewayIp && ip.includes(gatewayIp)) {
    return NextResponse.json({ allowed: true, ip });
  }

  // Jika WIFI_GATEWAY_IP belum diset, izinkan sementara untuk testing
  if (!gatewayIp) {
    return NextResponse.json({ allowed: true, ip, warning: "WIFI_GATEWAY_IP not set" });
  }

  return NextResponse.json({ allowed: false, ip }, { status: 403 });
}
