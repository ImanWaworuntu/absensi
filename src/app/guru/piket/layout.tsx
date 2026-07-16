import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function PiketLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role === "admin") {
    return <>{children}</>;
  }

  // Validate Piket Schedule
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Makassar', weekday: 'long' as const };
  const todayStr = new Intl.DateTimeFormat('id-ID', options).format(now);

  const jadwal = await prisma.jadwalPiket.findFirst({
    where: {
      guru_id: session.id,
      hari: {
        equals: todayStr as any,
        mode: "insensitive"
      }
    }
  });

  if (!jadwal) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bukan Jadwal Anda</h2>
          <p className="text-gray-500 mb-6">Anda tidak memiliki jadwal piket pada hari {todayStr}.</p>
          <a href="/guru" className="inline-block px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Kembali</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
