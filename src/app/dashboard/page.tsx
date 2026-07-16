import { Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const stats = [
  { name: "Total Guru", value: "45", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Hadir Hari Ini", value: "38", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Terlambat", value: "4", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Belum Absen", value: "3", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ringkasan Hari Ini</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20">
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log Presensi Terbaru */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Log Kehadiran Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Nama Guru</th>
                <th scope="col" className="px-6 py-4 font-semibold">Waktu</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Budi Santoso, S.Pd", time: "06:45", status: "Hadir", type: "success" },
                { name: "Siti Aminah, M.Pd", time: "07:15", status: "Terlambat", type: "warning" },
                { name: "Joko Anwar, S.Kom", time: "06:50", status: "Hadir", type: "success" },
              ].map((log, i) => (
                <tr key={i} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{log.name}</td>
                  <td className="px-6 py-4">{log.time} WIB</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      log.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-primary-dark font-medium text-sm">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
