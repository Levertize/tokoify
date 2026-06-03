# Setup Lokal Tokoify

Panduan ini menjelaskan cara melakukan setup database Supabase dan caching Upstash Redis untuk pengembangan lokal.

## Prasyarat
- Node.js 20 LTS
- pnpm (`npm install -g pnpm`)
- Akun Supabase (https://supabase.com) — gratis
- Akun Upstash (https://upstash.com) — gratis

---

## 1. Setup Database (Supabase)
1. Buat project baru di Supabase.
2. Masuk ke **Project Settings** → **Database** → **Connection String**.
3. Pilih tab **URI**:
   - Salin URL **Transaction** (port 6543) → gunakan sebagai nilai `DATABASE_URL` (ganti kata sandi `[YOUR-PASSWORD]` dengan password database Anda, sertakan query parameter `&pgbouncer=true&connection_limit=1`).
   - Salin URL **Session** (port 5432) → gunakan sebagai nilai `DIRECT_URL` (ganti kata sandi `[YOUR-PASSWORD]` dengan password database Anda).

---

## 2. Setup Redis (Upstash)
1. Buat database baru di Upstash Console.
2. Pilih region terdekat (misalnya: Singapore).
3. Salin **REST URL** → gunakan sebagai nilai `UPSTASH_REDIS_REST_URL`.
4. Salin **REST Token** → gunakan sebagai nilai `UPSTASH_REDIS_REST_TOKEN`.

---

## 3. Menjalankan Proyek Secara Lokal

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Setup environment variables:**
   Salin file `.env.example` ke `.env`:
   - Di CMD/PowerShell Windows:
     ```powershell
     copy apps/api/.env.example apps/api/.env
     ```
   - Di bash/sh:
     ```bash
     cp apps/api/.env.example apps/api/.env
     ```
   Edit file `apps/api/.env` dan masukkan kredensial Supabase serta Upstash Redis Anda.

3. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

4. **Jalankan Database Migration ke Supabase:**
   ```bash
   pnpm db:migrate
   ```

5. **Jalankan Development Server:**
   ```bash
   pnpm dev
   ```
   Atau jalankan server secara terpisah:
   - Frontend: `pnpm dev:web` (http://localhost:3000)
   - Backend: `pnpm dev:api` (http://localhost:3001)
