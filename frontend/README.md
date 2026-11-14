# Frontend App

Aplikasi pengguna (*Single Page Application*) untuk **Visit Flow** (Manajemen Rencana & Kunjungan) yang dibangun menggunakan **React**, **Vite**, **TypeScript**, dan **Tailwind CSS**.

> Untuk panduan lengkap proyek, arsitektur sistem, akun demo login, alasan pemilihan *tech stack*, serta transparansi penggunaan AI, silakan merujuk ke [`README.md`](../README.md) di direktori utama.

## Menjalankan Frontend

1. **Instalasi Dependensi & Konfigurasi Environment**
   ```bash
   npm install
   cp .env.example .env
   ```

2. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Aplikasi berjalan di `http://localhost:5173` dan terhubung ke backend (`VITE_API_URL=http://localhost:3000/api`).

3. **Build Produksi**
   ```bash
   npm run build
   ```
