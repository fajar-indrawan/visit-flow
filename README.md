# Visit Flow — Field Visit Management

Aplikasi web **Visit Flow** untuk membantu tim lapangan mencatat, menjadwalkan, dan memantau realisasi kunjungan pada segmen **B2G** (*Business-to-Government*) dan **B2B** (*Business-to-Business*), lengkap dengan pencatatan **Nama Sales** pada setiap aktivitas kunjungan serta ringkasan statistik yang sinkron dengan filter aktif.

---

## Fitur Utama

- **Autentikasi & Proteksi Route:** Login berbasis JWT (`Bearer Token`) dengan pemisahan peran (`SALES` dan `ADMIN`), proteksi halaman frontend, serta guard endpoint di backend.
- **Pencatatan Nama Sales (*Field Sales Tracking*):** Setiap pembuatan rencana kunjungan mencatat nama sales yang bertugas (`salesName`) dan menampilkannya langsung pada tabel monitoring realisasi kunjungan.
- **Monitoring & Filter Server-Side:** Penyaringan kombinasi berdasarkan segmen (`B2G`/`B2B`), status kunjungan (`NOT_VISITED`/`VISITED`), pencarian nama entitas, dan tanggal (`from`–`to`) yang diproses langsung di server.
- **Ringkasan Aktivitas Konsisten:** Kartu ringkasan (*Total Kunjungan*, *Sudah Dikunjungi*, *Belum Dikunjungi*) dihitung dari dataset terfilter yang sama sehingga selalu akurat.
- **Implementasi Tipe & Fallback Riwayat Entitas:** Membedakan entitas bernama serupa menggunakan jenis entitas (`type`) serta melakukan pencarian otomatis ke riwayat kunjungan apabila entitas tidak ditemukan di data master.
- **Pembaruan Realisasi Kunjungan:** Mengubah status rencana kunjungan menjadi *Sudah Dikunjungi* (`VISITED`) secara *real-time*.

---

## Alasan Pemilihan Tech Stack & Library

| Kategori | Teknologi / Library | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend Framework** | **NestJS (TypeScript)** | Menyediakan arsitektur modular berbasis *Dependency Injection* (`AuthModule`, `EntitiesModule`, `ActivitiesModule`) sehingga pemisahan *controller*, *service*, dan aturan bisnis tetap rapi dan mudah diuji. |
| **ORM & Database** | **Prisma ORM v6 + MySQL** | Skema deklaratif (`schema.prisma`) menghasilkan *client* yang *type-safe*, memudahkan pengelolaan relasi, migrasi tabel, serta pembuatan data seed buatan sendiri (`prisma/seed.ts`). |
| **Autentikasi & Keamanan** | **Passport JWT + `bcrypt`** | Standar industri untuk autentikasi *stateless* berbasis token (`JwtAuthGuard`) serta enkripsi *password* yang aman sebelum disimpan ke database. |
| **Validasi Request** | **`class-validator` & `class-transformer`** | Memastikan seluruh payload API (`CreateActivityDto`, `UpdateActivityStatusDto`, `QueryActivityDto`) tervalidasi secara otomatis sebelum masuk ke bisnis utama. |
| **Frontend Framework** | **React 19 + Vite + TypeScript** | Memberikan pengalaman pengembangan yang cepat serta konsistensi tipe data (*end-to-end type safety*) yang selaras dengan kontrak API backend. |
| **Routing & UI Styling** | **React Router v7 + Tailwind CSS v4 + Lucide React** | Mempermudah penerapan *Protected Route* untuk halaman terautentikasi serta membangun antarmuka dashboard yang bersih, responsif, dan konsisten tanpa *overhead* CSS berlebih. |
| **Automated Testing** | **Jest + Supertest** | Memungkinkan pengujian *End-to-End* (E2E) langsung terhadap endpoint HTTP dan aturan bisnis utama secara otomatis dan terukur. |

---

## Transparansi Penggunaan AI

Dalam pengembangan prototype **Visit Flow**, AI digunakan sebagai (*pair programmer*) dengan porsi sekitar **60% bantuan AI** dan **40% pengerjaan serta verifikasi mandiri** (analisis spesifikasi bisnis, konfigurasi environment & database MySQL, penyesuaian data seed, integrasi frontend–backend, *debugging*, serta pengujian fungsional menyeluruh).

Rincian fungsi dan bagian kode yang menggunakan bantuan AI meliputi:

1. **Autentikasi & Struktur Module Backend (`backend/src/auth/` & `prisma/`):**
   - `AuthService.login()` dan `JwtStrategy.validate()`: Implementasi verifikasi kredensial berbasis `bcrypt` serta pembuatan payload JWT.
   - `prisma/schema.prisma` dan `prisma/seed.ts`: Penyusunan skema relasi tabel serta generator data seed awal.
2. **Logika Bisnis & Filter Backend (`backend/src/activities/` & `backend/src/entities/`):**
   - `ActivitiesService.findAll()`, `ActivitiesService.create()`, `ActivitiesService.updateStatus()`, dan `ActivitiesService.buildInclusiveDateRange()`: Implementasi filter kombinasi *server-side*, filter tanggal, pencatatan `salesName`, serta ringkasan (`summary`).
   - `EntitiesService.findAll()`: Implementasi deduplikasi entitas berbasis `name` + `type` dan mekanisme *fallback* pencarian ke riwayat tabel `activities`.
3. **Pengujian Otomatis (`backend/test/app.e2e-spec.ts`):**
   - Penyusunan *test suite* Jest & Supertest untuk memverifikasi proteksi JWT, filter kombinasi, fallback entitas, dan pembaruan status kunjungan.
4. **Komponen Frontend & API Client (`frontend/src/`):**
   - `src/api/client.ts` dan `src/context/AuthContext.tsx`: Pembuatan HTTP wrapper dengan penyisipan `Bearer Token` dan manajemen sesi login.
   - `src/pages/LoginPage.tsx`, `src/pages/DashboardPage.tsx`, dan `src/components/CreateVisitModal.tsx`: Penyusunan antarmuka pengguna dan tata letak komponen menggunakan Tailwind CSS.

---

## Struktur Repository

```text
visit-flow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Skema tabel users, entities, dan activities
│   │   ├── seed.ts             # Generator data seed
│   │   └── visit_flow.sql      # Ekspor SQL struktur & data seed
│   ├── src/
│   │   ├── auth/               # Login JWT & JwtAuthGuard
│   │   ├── entities/           # Master entitas, fallback riwayat, & deduplikasi type
│   │   ├── activities/         # CRUD aktivitas, filter server-side, & ringkasan
│   │   └── prisma/             # PrismaService
│   ├── test/
│   │   └── app.e2e-spec.ts     # Pengujian aturan bisnis & kontrak API
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                # HTTP client terautentikasi (Bearer Token)
│   │   ├── components/         # Modal buat rencana kunjungan (dengan Nama Sales)
│   │   ├── context/            # State autentikasi & proteksi route
│   │   └── pages/              # Halaman Login & Dashboard
│   └── .env.example
└── README.md
```

---

## Prasyarat

- **Node.js** v20+ dan **npm**
- **MySQL** / **MariaDB** aktif (misal melalui XAMPP / Laragon / Docker)

---

## Cara Menjalankan Aplikasi

### 1. Setup & Jalankan Backend (`http://localhost:3000/api`)

```bash
cd backend
npm install

# Salin konfigurasi environment dan sesuaikan .env
cp .env.example .env

# Jalankan skema tabel ke MySQL & isi data seed
npx prisma db push
npx prisma db seed

# Jalankan server backend
npm run start:dev
```

*(Alternatif database: file `backend/prisma/visit_flow.sql` juga tersedia jika ingin melakukan import manual ke MySQL/phpMyAdmin).*

### 2. Setup & Jalankan Frontend (`http://localhost:5173`)

Jalankan terminal baru di root repository:

```bash
cd frontend
npm install

# Salin konfigurasi environment frontend
cp .env.example .env

# Jalankan aplikasi frontend
npm run dev
```

Akses aplikasi melalui browser di **`http://localhost:5173`**.

---

## Akun

Seluruh halaman dan endpoint dilindungi autentikasi. Gunakan salah satu akun demo berikut untuk masuk (halaman `/login`):

| Akses | Email | Password |
| :--- | :--- | :--- |
| **Sales** | `sales@visitflow.id` | `password123` |
| **Admin** | `admin@visitflow.id` | `password123` |

---

## Cara Menjalankan Pengujian Otomatis

Pastikan database MySQL aktif, lalu jalankan suite pengujian aturan bisnis & API di folder `backend`:

```bash
cd backend
npm run test:e2e

# (Opsional) Reset ulang data seed setelah pengujian selesai
npx prisma db seed
```

Cakupan pengujian meliputi:
1. Protection akses tanpa token login (`401 Unauthorized`).
2. Filter kombinasi (`segment`, `status`, `search`), rentang tanggal inklusif (`from`–`to`), dan konsistensi angka ringkasan (`summary`).
3. Pembedaan entitas bernama serupa menggunakan `type` serta mekanisme *fallback* pencarian ke riwayat kunjungan saat data tidak ditemukan di master entitas.
4. Pembuatan rencana kunjungan baru serta pencatatan `salesName` dan pembaruan status menjadi `VISITED`.

---

## Ringkasan Kontrak API

Seluruh endpoint selain `/api/auth/login` membutuhkan header `Authorization: Bearer <token>`.

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autentikasi akun demo dan mengembalikan `accessToken` + profil user. |
| `GET` | `/api/activities` | Mengambil daftar kunjungan & `summary` terfilter (`segment`, `status`, `from`, `to`, `search`). |
| `POST` | `/api/activities` | Membuat rencana kunjungan baru (`entityId`, `segment`, `visitDate`, `salesName`) dengan status awal `NOT_VISITED`. |
| `PATCH` | `/api/activities/:id` | Memperbarui status kunjungan (`VISITED` / `NOT_VISITED`). |
| `GET` | `/api/entities` | Mengambil daftar entitas berdasarkan `segment` & `search` dengan *fallback* otomatis ke riwayat kunjungan. |
