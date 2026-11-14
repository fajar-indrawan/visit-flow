# Backend API

REST API untuk aplikasi **Visit Flow** (Manajemen Rencana & Kunjungan) yang dibangun menggunakan **NestJS**, **Prisma ORM**, dan **MySQL**.

> Untuk panduan lengkap proyek, arsitektur sistem, akun demo login, alasan pemilihan *tech stack*, serta transparansi penggunaan AI, silakan merujuk ke [`README.md`](../README.md) di direktori utama.

## Menjalankan Backend

1. **Instalasi Dependensi & Konfigurasi Environment**
   ```bash
   npm install
   cp .env.example .env
   ```

2. **Sinkronisasi Database & Data Seed**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
   *(Alternatif: impor langsung file dump SQL dari `prisma/visit_flow.sql` ke database `visit_flow`.)*

3. **Jalankan Server & Pengujian**
   ```bash
   npm run start:dev   # Berjalan di http://localhost:3000/api
   npm run test:e2e    # Menjalankan pengujian otomatis
   ```
