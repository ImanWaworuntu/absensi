import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aplikasi Presensi Guru YAPKI',
    short_name: 'Presensi YAPKI',
    description: 'Aplikasi Presensi Digital untuk Guru YAPKI',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#009646',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
