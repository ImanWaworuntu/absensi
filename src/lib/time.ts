export const SCHEDULE_SLOTS = [
  { id: 1, label: "Jam ke-1", start: "07:30", end: "08:15" },
  { id: 2, label: "Jam ke-2", start: "08:15", end: "09:00" },
  { id: 3, label: "Jam ke-3", start: "09:00", end: "09:45" },
  { id: 4, label: "Jam ke-4", start: "09:45", end: "10:15" },
  // Istirahat 10.15 - 10.45
  { id: 5, label: "Jam ke-5", start: "10:45", end: "11:30" },
  { id: 6, label: "Jam ke-6", start: "11:30", end: "12:00" },
  // Istirahat 12.00 - 12.40
  { id: 7, label: "Jam ke-7", start: "12:40", end: "13:15" },
  { id: 8, label: "Jam ke-8", start: "13:15", end: "14:00" },
];

// Dapatkan waktu saat ini di zona waktu Makassar (WITA)
export function getNowWITA(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 8); // UTC+8
}

// Format waktu WITA menjadi string HH:MM
export function getWitaTimeString(): string {
  const wita = getNowWITA();
  const h = String(wita.getHours()).padStart(2, "0");
  const m = String(wita.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Cek apakah slot waktu tersedia untuk di-absen (H-15 menit s/d berakhir)
export function getAvailableSlots(): { id: number; label: string; start: string; end: string; status: "available" | "upcoming" | "passed" }[] {
  const nowStr = getWitaTimeString();
  const nowMinutes = timeToMinutes(nowStr);

  return SCHEDULE_SLOTS.map((slot) => {
    const startMinutes = timeToMinutes(slot.start);
    const endMinutes = timeToMinutes(slot.end);

    let status: "available" | "upcoming" | "passed";

    if (nowMinutes < startMinutes - 15) {
      status = "upcoming";
    } else if (nowMinutes > endMinutes) {
      status = "passed";
    } else {
      status = "available";
    }

    return { ...slot, status };
  });
}

// Validasi apakah slot valid
export function isValidSlotForAttendance(jam_ke: number): boolean {
  const slots = getAvailableSlots();
  const slot = slots.find((s) => s.id === jam_ke);
  return slot?.status === "available";
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}
