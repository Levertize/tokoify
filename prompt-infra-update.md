# 🔧 Prompt: Infra Update — Supabase + Upstash (Ganti Docker PostgreSQL & Redis)



---

## KONTEKS PROJECT

Kamu adalah senior full-stack developer yang mengerjakan proyek e-commerce **Tokoify**.
Proyek ini adalah monorepo dengan struktur berikut:

```
tokoify/
├── apps/
│   ├── web/          ← Next.js 16 Frontend (@tokoify/web)
│   └── api/          ← Express.js Backend (@tokoify/api)
├── packages/
│   └── shared-types/ ← Shared TypeScript types (@tokoify/shared-types)
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### Status M1 yang sudah selesai:
- ✅ Monorepo setup dengan Turborepo + pnpm workspaces
- ✅ Express.js backend dengan helmet, CORS, morgan, health checks
- ✅ Prisma schema dengan 17 models, 5 enums
- ✅ Zod env validation di `apps/api/src/config/env.ts`
- ✅ Redis client (ioredis) di `apps/api/src/lib/redis.ts`
- ✅ Custom error classes, response utils, global error handler, Winston logger
- ✅ Docker Compose dengan PostgreSQL 16 + Redis 7

### Rules yang WAJIB diikuti:
- Semua credential di `.env`, TIDAK PERNAH hardcode
- Validasi semua env vars saat startup via Zod (`apps/api/src/config/env.ts`)
- Gunakan pnpm sebagai package manager
- TypeScript strict mode, tidak boleh ada `any`
- Jangan ubah file yang tidak perlu diubah

---

## TASK: Migrasi Database & Redis dari Docker ke Cloud

### Tujuan:
Hapus ketergantungan Docker untuk PostgreSQL dan Redis.
Ganti dengan:
- **PostgreSQL** → **Supabase** (cloud database)
- **Redis** → **Upstash Redis** (serverless Redis)

Docker tidak dibutuhkan lagi setelah ini.

---

## PERUBAHAN YANG HARUS DILAKUKAN

### 1. Update `apps/api/prisma/schema.prisma`

Tambahkan `directUrl` untuk Supabase connection pooling (wajib untuk Prisma + Supabase):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Penjelasan:**
- `DATABASE_URL` → Supabase **pooled** connection (via pgBouncer, port 6543) — untuk query sehari-hari
- `DIRECT_URL` → Supabase **direct** connection (port 5432) — khusus untuk `prisma migrate`

### 2. Update `apps/api/src/lib/redis.ts`

Ganti implementasi dari `ioredis` biasa ke `@upstash/redis`:

```typescript
// apps/api/src/lib/redis.ts
import { Redis } from '@upstash/redis';
import { env } from '@/config/env';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper: set dengan TTL (seconds)
export const setCache = async (key: string, value: unknown, ttlSeconds?: number) => {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serialized, { ex: ttlSeconds });
  } else {
    await redis.set(key, serialized);
  }
};

// Helper: get dan parse JSON
export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get<string>(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
};

// Helper: delete key
export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export default redis;
```

Install package yang diperlukan:
```bash
cd apps/api && pnpm add @upstash/redis
```

### 3. Update `apps/api/src/config/env.ts`

Ganti/tambahkan environment variables yang berkaitan dengan database dan Redis:

```typescript
// Hapus atau update bagian yang berkaitan dengan database dan redis
// Tambahkan variabel berikut ke Zod schema:

const envSchema = z.object({
  // ... existing vars tetap ada ...

  // DATABASE - Supabase
  DATABASE_URL: z.string().url('DATABASE_URL harus berupa URL valid'),
  DIRECT_URL: z.string().url('DIRECT_URL harus berupa URL valid'),

  // REDIS - Upstash (ganti REDIS_URL yang lama)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL harus berupa URL valid'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN wajib diisi'),
});
```

Hapus `REDIS_URL` dari schema jika ada, ganti dengan dua variabel Upstash di atas.

### 4. Update `apps/api/.env.example`

Ganti seluruh bagian DATABASE dan REDIS dengan yang baru:

```env
# ================================
# APPLICATION
# ================================
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# ================================
# DATABASE — Supabase
# Ambil dari: Supabase Dashboard → Project Settings → Database → Connection String
# ================================

# Pooled connection (untuk query) — Transaction mode, port 6543
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (untuk prisma migrate) — port 5432
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ================================
# REDIS — Upstash
# Ambil dari: Upstash Console → Database → REST API
# ================================
UPSTASH_REDIS_REST_URL="https://[YOUR-ENDPOINT].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[YOUR-TOKEN]"

# ================================
# JWT (Generate: openssl genrsa -out private.pem 2048)
# ================================
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ================================
# MIDTRANS
# ================================
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx

# ================================
# CLOUDINARY
# ================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ================================
# EMAIL (SMTP)
# ================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Tokoify <noreply@tokoify.com>"

# ================================
# RAJAONGKIR / BINDERBYTE
# ================================
RAJAONGKIR_API_KEY=your-api-key
RAJAONGKIR_BASE_URL=https://api.rajaongkir.com/starter

# ================================
# GOOGLE OAUTH
# ================================
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# ================================
# FRONTEND (Next.js)
# ================================
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Update `docker-compose.yml`

Hapus service `postgres` karena sudah digantikan Supabase.
Hapus juga service `redis` karena sudah digantikan Upstash.
File `docker-compose.yml` bisa dihapus sepenuhnya atau diganti dengan komentar penjelasan:

```yaml
# docker-compose.yml
# ============================================================
# Database (PostgreSQL) dan Redis sudah dipindahkan ke cloud:
#   - PostgreSQL → Supabase (https://supabase.com)
#   - Redis      → Upstash  (https://upstash.com)
#
# Tidak perlu menjalankan docker compose untuk development.
# Cukup isi apps/api/.env dengan credential dari masing-masing service.
# ============================================================
```

### 6. Update root `package.json`

Hapus script yang berkaitan dengan Docker:
- Hapus `docker:up`, `docker:down`, atau sejenisnya jika ada
- Update script `db:migrate` agar tidak bergantung pada Docker running

```json
{
  "scripts": {
    "dev:web": "turbo run dev --filter=@tokoify/web",
    "dev:api": "turbo run dev --filter=@tokoify/api",
    "dev": "turbo run dev",
    "build": "turbo run build",
    "db:migrate": "cd apps/api && pnpm prisma migrate dev",
    "db:migrate:prod": "cd apps/api && pnpm prisma migrate deploy",
    "db:studio": "cd apps/api && pnpm prisma studio",
    "db:generate": "cd apps/api && pnpm prisma generate",
    "db:seed": "cd apps/api && pnpm prisma db seed",
    "type-check": "turbo run type-check",
    "lint": "turbo run lint"
  }
}
```

### 7. Update README / How to Run section

Ganti bagian "How to Run" di README.md (jika ada) atau tambahkan file `SETUP.md`:

```markdown
## Setup Lokal

### Prerequisites
- Node.js 20 LTS
- pnpm (`npm install -g pnpm`)
- Akun Supabase (https://supabase.com) — gratis
- Akun Upstash (https://upstash.com) — gratis

### Cara Setup Database (Supabase)
1. Buat project baru di Supabase
2. Pergi ke Project Settings → Database → Connection String
3. Copy "Transaction" URL → isi sebagai DATABASE_URL (ganti [YOUR-PASSWORD])
4. Copy "Session" URL → isi sebagai DIRECT_URL (ganti [YOUR-PASSWORD])

### Cara Setup Redis (Upstash)
1. Buat database baru di Upstash Console
2. Pilih region terdekat (Singapore)
3. Copy REST URL → isi sebagai UPSTASH_REDIS_REST_URL
4. Copy REST Token → isi sebagai UPSTASH_REDIS_REST_TOKEN

### Menjalankan Project
```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env dengan credential Supabase dan Upstash kamu

# 3. Generate Prisma client
pnpm db:generate

# 4. Jalankan database migration ke Supabase
pnpm db:migrate

# 5. Jalankan development servers
pnpm dev:web    # Frontend: http://localhost:3000
pnpm dev:api    # Backend:  http://localhost:3001
```
```

---

## VERIFIKASI SETELAH SELESAI

Pastikan semua check ini lulus 

```bash
# 1. Install dependencies baru
cd apps/api && pnpm install

# 2. TypeScript tidak ada error
pnpm type-check

# 3. Prisma schema valid (dengan DIRECT_URL yang sudah diisi)
cd apps/api && pnpm prisma validate

# 4. Migration berhasil ke Supabase (butuh .env sudah diisi)
pnpm db:migrate

# 5. Backend bisa start tanpa error
pnpm dev:api
# Harusnya muncul: "Server running on port 3001"
# Health check: GET http://localhost:3001/health → { status: 'ok' }
```

---

## CATATAN PENTING

1. **Jangan ubah `schema.prisma` kecuali tambahan `directUrl`** — semua 17 model tetap sama
2. **`@upstash/redis` berbeda dengan `ioredis`** — API-nya HTTP-based, tidak ada `.connect()` atau `.disconnect()`
3. **BullMQ tidak kompatibel dengan `@upstash/redis`** — BullMQ akan disetup di fase M4+ menggunakan Upstash Redis dengan ioredis URL (bukan REST). Untuk sekarang, BullMQ belum diimplementasikan jadi tidak perlu dikhawatirkan.
4. **Supabase connection pooling wajib** untuk menghindari "too many connections" di free tier
5. **Pastikan `.env` ada di `.gitignore`** — jangan sampai credential ter-commit ke git
