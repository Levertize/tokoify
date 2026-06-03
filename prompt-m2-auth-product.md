# 🚀 Prompt: M2 — Auth, Produk, Kategori, Image Upload



---

## KONTEKS PROJECT

Kamu adalah senior full-stack developer yang mengerjakan proyek e-commerce **Tokoify**.

### Status saat ini (sudah selesai):
- ✅ M1: Monorepo, Express backend, Prisma schema 17 models, env validation
- ✅ Infra: PostgreSQL → Supabase, Redis → Upstash (`@upstash/redis`)
- ✅ Utils: Custom errors, response helpers, Winston logger, global error handler
- ✅ Lib: `prisma.ts` (singleton), `redis.ts` (Upstash), `env.ts` (Zod validated)

### Stack yang digunakan:
```
Backend  : Express.js + TypeScript (apps/api/)
Frontend : Next.js 16 App Router + TypeScript (apps/web/)
Database : PostgreSQL via Supabase + Prisma ORM
Cache    : Upstash Redis (@upstash/redis)
Storage  : Cloudinary (untuk gambar)
Auth     : JWT RS256 (access token) + Refresh Token (HttpOnly cookie)
Styling  : Tailwind CSS + shadcn/ui
```

### Struktur module yang WAJIB diikuti:
```
apps/api/src/modules/[nama-modul]/
├── [modul].controller.ts   ← Hanya terima request, panggil service, return response
├── [modul].service.ts      ← Semua business logic di sini
├── [modul].routes.ts       ← Route definitions + middleware chain
├── [modul].schema.ts       ← Zod schemas untuk validasi
└── [modul].types.ts        ← TypeScript types/interfaces
```

### Rules WAJIB (dari rules.md):
- Controller TIDAK boleh ada business logic — hanya call service + return response
- Service mengandung SEMUA business logic
- Semua input WAJIB divalidasi dengan Zod sebelum masuk service
- Return type semua async function HARUS eksplisit
- Tidak boleh ada `any` di TypeScript
- Error menggunakan custom error classes (BadRequestError, UnauthorizedError, dll.)
- Response menggunakan `successResponse()` dan `paginatedResponse()` dari response.utils.ts
- Password hash: bcrypt dengan cost factor 12
- Access token: JWT RS256, expire 15 menit, simpan di memory (bukan localStorage)
- Refresh token: expire 7 hari, simpan di HttpOnly cookie (secure, sameSite: strict)

---

## TASK M2: 4 Modul yang Harus Dibangun

---

## MODUL 1: AUTH (`apps/api/src/modules/auth/`)

### Endpoint yang harus dibuat:

| Method | Route | Auth | Deskripsi |
|--------|-------|------|-----------|
| POST | `/api/v1/auth/register` | Public | Registrasi user baru |
| POST | `/api/v1/auth/login` | Public | Login, return JWT |
| POST | `/api/v1/auth/logout` | 🔒 | Logout, revoke refresh token |
| POST | `/api/v1/auth/refresh-token` | Cookie | Refresh access token |
| GET | `/api/v1/auth/verify-email/:token` | Public | Verifikasi email |
| POST | `/api/v1/auth/forgot-password` | Public | Request reset password |
| POST | `/api/v1/auth/reset-password` | Public | Reset password dengan token |
| GET | `/api/v1/auth/me` | 🔒 | Get profil user saat ini |

### Spesifikasi detail:

**Register (POST /register):**
- Input: `{ email, password, name, phone? }`
- Validasi: email unik, password min 8 karakter (ada huruf besar, angka, simbol)
- Hash password dengan bcrypt (rounds: 12)
- Buat record `EmailVerification` dengan token UUID + expire 1 jam
- Kirim email verifikasi (gunakan job queue Upstash QStash ATAU langsung nodemailer — pilih nodemailer untuk simplicity M2)
- Return: `{ message: 'Registrasi berhasil. Cek email untuk verifikasi.' }`
- Jangan return access token — user harus verifikasi email dulu

**Login (POST /login):**
- Input: `{ email, password }`
- Cek akun aktif (`isActive: true`) dan sudah diverifikasi (`isVerified: true`)
- Rate limit: 5 percobaan gagal dalam 15 menit → lockout (simpan counter di Upstash Redis)
- Jika berhasil: generate access token (JWT RS256, 15m) + refresh token (random 64 bytes hex, 7 hari)
- Simpan refresh token ke tabel `sessions` (dengan userId, device info, IP, expire)
- Set refresh token di HttpOnly cookie: `{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/v1/auth' }`
- Return: `{ user: { id, name, email, role, avatar }, accessToken }`

**Refresh Token (POST /refresh-token):**
- Baca refresh token dari cookie
- Cari di tabel `sessions`, validasi tidak expired
- Generate access token baru
- Lakukan token rotation: hapus session lama, buat session baru dengan refresh token baru
- Set cookie baru dengan refresh token baru
- Return: `{ accessToken }`

**Logout (POST /logout):**
- Baca refresh token dari cookie
- Hapus session dari database
- Clear cookie refresh token
- Return: `{ message: 'Logout berhasil' }`

**Verify Email (GET /verify-email/:token):**
- Cari token di tabel `email_verifications`
- Validasi: belum dipakai (`usedAt` null) dan belum expired
- Update `user.isVerified = true`
- Tandai token sebagai sudah dipakai (`usedAt = now()`)
- Redirect ke frontend: `${FRONTEND_URL}/login?verified=true`

**Forgot Password (POST /forgot-password):**
- Input: `{ email }`
- Jika email tidak ditemukan, tetap return sukses (jangan expose info user)
- Buat token reset (UUID, expire 1 jam) simpan di Redis: `password_reset:${token}` → userId
- Kirim email dengan link: `${FRONTEND_URL}/reset-password?token=xxx`
- Return: `{ message: 'Jika email terdaftar, link reset akan dikirim.' }`

**Reset Password (POST /reset-password):**
- Input: `{ token, password, confirmPassword }`
- Validasi password match + strength
- Ambil userId dari Redis key `password_reset:${token}`
- Jika tidak ada → token invalid/expired
- Hash password baru, update user
- Hapus Redis key (one-time use)
- Revoke semua session user (force logout semua device)
- Return: `{ message: 'Password berhasil diubah. Silakan login.' }`

**Get Me (GET /me):**
- Middleware `authenticate` harus sudah validasi JWT
- Return data user dari `req.user` (sudah di-attach oleh middleware)
- Include: `{ id, name, email, phone, avatar, role, isVerified, createdAt }`

### Middleware yang harus dibuat:

**`authenticate` middleware (`apps/api/src/middlewares/auth.middleware.ts`):**
```typescript
// Validasi JWT access token dari Authorization: Bearer <token>
// Decode payload, ambil userId
// Cari user di database (atau cache Redis 5 menit)
// Attach ke req.user
// Jika token invalid/expired → throw UnauthorizedError
```

**`authorize` middleware (`apps/api/src/middlewares/role.middleware.ts`):**
```typescript
// Terima list role yang diizinkan
// Cek req.user.role ada di list tersebut
// Jika tidak → throw ForbiddenError
// Usage: authorize('admin', 'super_admin')
```

**`validate` middleware (`apps/api/src/middlewares/validate.middleware.ts`):**
```typescript
// Terima Zod schema
// Parse req.body dengan schema
// Jika gagal → throw BadRequestError dengan detail field errors
// Attach parsed data ke req.body (sudah type-safe)
```

**Express type augmentation (`apps/api/src/types/express.d.ts`):**
```typescript
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    };
  }
}
```

### Dependencies yang perlu di-install (apps/api):
```bash
pnpm add jsonwebtoken bcrypt nodemailer cookie-parser
pnpm add -D @types/jsonwebtoken @types/bcrypt @types/nodemailer @types/cookie-parser
```

### Setup di `app.ts`:
Tambahkan `cookie-parser` middleware sebelum routes:
```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());
```

---

## MODUL 2: KATEGORI (`apps/api/src/modules/categories/`)

### Endpoint:

| Method | Route | Auth | Deskripsi |
|--------|-------|------|-----------|
| GET | `/api/v1/categories` | Public | List semua kategori (dengan sub-kategori) |
| GET | `/api/v1/categories/:id` | Public | Detail kategori + produk count |
| POST | `/api/v1/categories` | 🔒 Admin | Buat kategori baru |
| PUT | `/api/v1/categories/:id` | 🔒 Admin | Edit kategori |
| DELETE | `/api/v1/categories/:id` | 🔒 Admin | Hapus kategori (soft check: tidak ada produk aktif) |

### Spesifikasi:
- GET /categories: Cache di Upstash Redis dengan key `categories:all`, TTL 1 jam
- Invalidate cache saat ada POST/PUT/DELETE
- Response GET /categories harus berbentuk tree (parent → children):
```json
[
  {
    "id": "...",
    "name": "Elektronik",
    "slug": "elektronik",
    "image": "...",
    "children": [
      { "id": "...", "name": "Smartphone", "slug": "smartphone", "productCount": 42 }
    ]
  }
]
```
- Slug di-generate otomatis dari nama (lowercase, spaces → hyphens, hapus karakter spesial)
- Validasi slug unik sebelum insert/update

---

## MODUL 3: PRODUK (`apps/api/src/modules/products/`)

### Endpoint:

| Method | Route | Auth | Deskripsi |
|--------|-------|------|-----------|
| GET | `/api/v1/products` | Public | List produk dengan filter + pagination |
| GET | `/api/v1/products/:slug` | Public | Detail produk + variants + images |
| POST | `/api/v1/products` | 🔒 Seller/Admin | Buat produk baru |
| PUT | `/api/v1/products/:id` | 🔒 Seller/Admin | Edit produk |
| DELETE | `/api/v1/products/:id` | 🔒 Seller/Admin | Soft delete produk |
| POST | `/api/v1/products/:id/images` | 🔒 Seller/Admin | Upload gambar (max 5, 2MB/file) |
| DELETE | `/api/v1/products/:id/images/:imageId` | 🔒 Seller/Admin | Hapus gambar |
| PATCH | `/api/v1/products/:id/variants` | 🔒 Seller/Admin | Update stok/harga varian |

### Spesifikasi GET /products (query params):
```
?page=1             → pagination (default: 1)
&limit=20           → items per page (max: 100, default: 20)
&categoryId=xxx     → filter by category
&minPrice=100000    → filter harga minimum
&maxPrice=500000    → filter harga maksimum
&q=sepatu           → full-text search (nama + deskripsi)
&sortBy=createdAt   → createdAt | price | rating | soldCount
&sortOrder=desc     → asc | desc
&sellerId=xxx       → filter by seller (untuk dashboard seller)
&isActive=true      → filter status (default: hanya tampil yang aktif + approved)
```

**Implementasi full-text search:**
```typescript
// Gunakan PostgreSQL Full-Text Search via Prisma raw query
// Hanya aktifkan jika query param `q` ada
where: q ? {
  OR: [
    { name: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
  ]
} : {}
```

**Response GET /products (per item):**
```json
{
  "id": "...",
  "name": "Sepatu Nike Air Max",
  "slug": "sepatu-nike-air-max",
  "basePrice": 850000,
  "lowestPrice": 750000,
  "discountPercent": 12,
  "primaryImage": "https://res.cloudinary.com/...",
  "avgRating": 4.5,
  "reviewCount": 23,
  "soldCount": 156,
  "isActive": true,
  "category": { "id": "...", "name": "Sepatu", "slug": "sepatu" },
  "seller": { "id": "...", "name": "Toko Olahraga" }
}
```

### Spesifikasi POST /products:
```typescript
// Input body:
{
  name: string,           // min 3, max 500
  categoryId: string,     // UUID valid
  description: string,    // min 20 karakter, akan di-sanitize HTML
  basePrice: number,      // positive
  weight: number,         // gram, positive
  tags?: string[],        // max 10 tags
  variants: [             // min 1 varian
    {
      sku: string,        // unik, min 3 karakter
      options: Record<string, string>,  // { "warna": "Merah", "ukuran": "42" }
      price: number,      // positive
      stock: number,      // non-negative integer
    }
  ]
}
```
- Auto-generate slug dari nama produk
- Jika slug sudah ada, tambahkan suffix: `sepatu-nike-air-max-2`
- `isApproved` default `false` — perlu admin approval (kecuali yang create adalah admin)
- Sanitasi HTML pada field `description` menggunakan `sanitize-html`
- Install: `pnpm add sanitize-html && pnpm add -D @types/sanitize-html`

### Spesifikasi Image Upload (POST /products/:id/images):
```typescript
// Gunakan Multer (memoryStorage) + Cloudinary
// Max 5 gambar per produk
// Max 2MB per file
// Format allowed: JPEG, PNG, WebP
// Upload ke Cloudinary folder: 'tokoify/products/:productId'
// Simpan URL hasil upload ke tabel product_images
// Set isPrimary = true jika ini gambar pertama untuk produk tersebut
```

**Setup Cloudinary (`apps/api/src/lib/cloudinary.ts`):**
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    ).end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
```

Install: `pnpm add cloudinary multer && pnpm add -D @types/multer`

**Setup Multer middleware (`apps/api/src/middlewares/upload.middleware.ts`):**
```typescript
import multer from 'multer';
import { BadRequestError } from '@/utils/errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const uploadImages = (fieldName: string, maxCount: number) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestError('Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.') as any);
      }
      cb(null, true);
    },
  }).array(fieldName, maxCount);
```

---

## MODUL 4: SETUP ROUTE INDEX

Buat file `apps/api/src/routes/index.ts` yang mengorganisir semua routes:

```typescript
import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import categoryRoutes from '@/modules/categories/category.routes';
import productRoutes from '@/modules/products/product.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;
```

Register di `app.ts`:
```typescript
import routes from '@/routes/index';
app.use('/api/v1', routes);
```

---

## FRONTEND: Halaman yang Harus Dibuat di M2

Buat halaman-halaman berikut di `apps/web/app/`:

### 1. Halaman Login (`app/(auth)/login/page.tsx`)
- Form: email + password
- Gunakan React Hook Form + Zod
- Call `POST /api/v1/auth/login`
- Simpan `accessToken` di Zustand store
- Redirect ke `/` setelah berhasil
- Link ke halaman register dan forgot password

### 2. Halaman Register (`app/(auth)/register/page.tsx`)
- Form: nama, email, password, konfirmasi password
- Validasi password strength real-time (indicator bar)
- Setelah berhasil: tampilkan halaman sukses "Cek email kamu"

### 3. Halaman Forgot Password (`app/(auth)/forgot-password/page.tsx`)
- Form: email
- Success state: tampilkan instruksi cek email

### 4. Halaman Reset Password (`app/(auth)/reset-password/page.tsx`)
- Baca `?token=xxx` dari URL params
- Form: password baru + konfirmasi
- Redirect ke login setelah berhasil

### 5. Katalog Produk (`app/(shop)/products/page.tsx`) — Server Component
- Fetch produk dari `GET /api/v1/products` di server
- Tampilkan ProductCard grid
- Filter sidebar (kategori, harga range)
- Pagination

### 6. Detail Produk (`app/(shop)/products/[slug]/page.tsx`) — Server Component
- Fetch detail produk dari `GET /api/v1/products/:slug`
- Tampilkan galeri foto, varian selector, deskripsi
- Client component untuk interaksi: pilih varian, add to cart, wishlist

### Setup Zustand Auth Store (`apps/web/store/authStore.ts`):
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isLoading: false }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ user: null, accessToken: null, isLoading: false }),
}));
```

### Setup Axios API Client (`apps/web/lib/api.ts`):
```typescript
// Instance axios dengan:
// - baseURL: process.env.NEXT_PUBLIC_API_URL
// - withCredentials: true (untuk cookie refresh token)
// - Request interceptor: tambahkan Authorization Bearer token
// - Response interceptor: handle 401 → auto refresh token → retry request
// Jika refresh token gagal → clearAuth() + redirect /login
```

---

## DEPENDENCIES LENGKAP YANG PERLU DI-INSTALL

### Backend (apps/api):
```bash
pnpm add jsonwebtoken bcrypt nodemailer cookie-parser sanitize-html cloudinary multer
pnpm add -D @types/jsonwebtoken @types/bcrypt @types/nodemailer @types/cookie-parser @types/sanitize-html @types/multer
```

### Frontend (apps/web):
```bash
pnpm add zustand axios @tanstack/react-query zod react-hook-form @hookform/resolvers
```

---

## VERIFIKASI AKHIR M2

Sebelum selesai, pastikan semua check ini lulus:

```bash
# TypeScript tidak ada error di kedua app
pnpm type-check

# Backend bisa start
pnpm dev:api
# Test: POST http://localhost:3001/api/v1/auth/register
# Test: POST http://localhost:3001/api/v1/auth/login
# Test: GET  http://localhost:3001/api/v1/products
# Test: GET  http://localhost:3001/api/v1/categories

# Frontend bisa build
pnpm dev:web
# Cek: http://localhost:3000/login
# Cek: http://localhost:3000/register
# Cek: http://localhost:3000/products
```

### Checklist fitur:
- [ ] Register berhasil → email verifikasi terkirim (atau log di console untuk development)
- [ ] Login berhasil → access token di response, refresh token di HttpOnly cookie
- [ ] GET /api/v1/auth/me dengan token valid → return user data
- [ ] GET /api/v1/auth/me tanpa token → 401 Unauthorized
- [ ] GET /api/v1/categories → return tree struktur dengan caching Redis
- [ ] POST /api/v1/categories tanpa auth → 401
- [ ] POST /api/v1/categories dengan role buyer → 403 Forbidden
- [ ] GET /api/v1/products → return paginated list
- [ ] GET /api/v1/products?q=sepatu → filter by search term
- [ ] POST /api/v1/products dengan role seller → berhasil create produk
- [ ] POST /api/v1/products/:id/images → upload gambar ke Cloudinary

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
1. Install semua dependencies
2. Buat auth middleware (authenticate, authorize, validate)
3. Buat auth module (service → schema → controller → routes)
4. Buat cloudinary.ts dan upload.middleware.ts
5. Buat category module
6. Buat product module
7. Update routes/index.ts
8. Update app.ts (cookie-parser, routes)
9. Buat frontend: authStore.ts, api.ts (axios client)
10. Buat halaman login, register
11. Buat halaman produk (catalog + detail)
12. Verifikasi semua endpoint
```
