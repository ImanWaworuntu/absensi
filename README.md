# Absensi Guru YAPKI 🏫

Aplikasi **Absensi Guru YAPKI** adalah platform presensi digital modern berbasis web yang dirancang khusus untuk mempermudah proses pencatatan kehadiran guru di lingkungan sekolah SMA PERGIS YAPKI Maros. Aplikasi ini mengeliminasi sistem absensi manual (kertas) dan menggantinya dengan sistem yang lebih cepat, transparan, dan terintegrasi dengan verifikasi berbasis lokasi dan foto wajah.

## ✨ Fitur Utama

- **Absen Mandiri Berbasis Foto**: Guru dapat melakukan absensi datang dan pulang secara mandiri menggunakan perangkat mereka dengan menangkap foto *selfie* secara *real-time* lewat kamera langsung.
- **Sistem Absensi Guru Piket**: Guru piket memiliki wewenang khusus dalam sistem untuk tidak hanya mengabsenkan dirinya sendiri, tetapi juga dapat membantu mengabsenkan guru mata pelajaran lain.
- **Validasi Geolocation (Anti-Kecurangan)**: Sistem akan meminta akses lokasi browser/HP dan mengirimkan data garis lintang & garis bujur (Latitude/Longitude) untuk memastikan kehadiran fisik di sekolah.
- **Timestamp & Penyimpanan Cloud**: Data dan foto absensi langsung dikirim dan disimpan dengan aman di *cloud* dalam hitungan detik.
- **Antarmuka Modern (Responsif)**: Desain UI sangat modern, ringan, dan bekerja dengan mulus baik jika diakses dari Smartphone (kamera HP) maupun Laptop/PC sekolah.

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Aplikasi ini dirancang dengan standar industri modern terkini untuk performa dan keamanan tinggi:

- **Framework Utama:** [Next.js (App Router)](https://nextjs.org/) & [React](https://react.dev/) - Menghasilkan halaman web yang super cepat dengan pendekatan Server Actions.
- **Desain & Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) - Untuk tata letak yang elegan dan animasi interaktif yang cantik.
- **Database Induk:** [Supabase](https://supabase.com/) (PostgreSQL) - Sebagai layanan database SQL di awan yang menampung profil pengguna, jadwal, dan riwayat presensi.
- **ORM (Penghubung Database):** [Prisma](https://www.prisma.io/) - Teknologi untuk mengelola struktur *schema* database dengan lebih aman dan mudah.
- **Penyimpanan Foto:** Supabase Storage (Bucket) - Semua foto jepretan saat absen langsung tersimpan di *cloud storage*.
- **Hosting / Deployment:** [Vercel](https://vercel.com/) - Infrastruktur server otomatis untuk menjaga web tetap hidup *online* 24 jam.

## 🚀 Cara Menjalankan di Komputer Lokal (Development)

Jika Anda ingin memodifikasi kode atau menjalankan versi *offline/localhost*, ikuti langkah ini:

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/ImanWaworuntu/absensi.git
   cd absensi
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Atur Variabel Lingkungan:**
   Buka (atau buat) file `.env` dan masukkan kredensial Supabase Anda. Anda dapat melihat formatnya di `.env.example`.

4. **Sinkronisasi Database:**
   ```bash
   npx prisma db push
   ```

5. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

---
*Dikembangkan untuk memajukan era digitalisasi administrasi pendidikan di SMA PERGIS YAPKI Maros.*
