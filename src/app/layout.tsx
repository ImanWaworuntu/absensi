import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Presensi Guru YAPKI - Aplikasi Presensi Digital",
  description: "Sistem pencatatan kehadiran guru berbasis web dengan validasi jaringan Wi-Fi dan geo-tagging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="antialiased">
      <body
        className={`${inter.variable} font-sans bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
