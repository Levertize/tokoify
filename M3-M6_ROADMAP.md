# 🗺️ Prompt: Roadmap M3–M6 — Tokoify

> Gunakan file ini sebagai **peta navigasi** setelah M2 selesai.
> Jalankan satu phase setiap sesi. Refer ke prd.md untuk detail requirement.

---

## KONTEKS PROJECT (selalu sertakan di awal setiap sesi)

**Project:** Tokoify — E-Commerce Full-Stack Monorepo
**Stack:** Next.js 16 (App Router) · Express.js · Prisma · PostgreSQL (Supabase) · Redis (Upstash) · TypeScript · Tailwind · shadcn/ui

**Yang sudah selesai:**
- ✅ M1: Monorepo, Prisma schema 17 models, env, utils, logger
- ✅ Infra: Supabase + Upstash (no Docker)
- ✅ M2: Auth JWT (register/login/refresh/verify), Kategori, Produk CRUD, Cloudinary upload, halaman login/register/katalog/detail produk

**Pola yang WAJIB diikuti di semua phase:**
- Module struktur: `controller` → `service` → `schema` → `routes` → `types`
- Controller: hanya call service + return response. Tidak ada logic.
- Validasi input: selalu Zod. Tidak ada `any`.
- Error: gunakan custom error classes yang sudah ada
- Response: gunakan `successResponse()` / `paginatedResponse()`
- Cache: Upstash Redis untuk data yang sering diakses
- Frontend: Server Component by default, `'use client'` hanya jika butuh interaktivitas

---

## M3 — Keranjang, Wishlist & Pencarian

**Tujuan:** User bisa menyimpan produk ke keranjang/wishlist dan mencari produk.

### Backend — buat modul:

**Cart (`/api/v1/cart`):**
- `GET /cart` — ambil isi keranjang user (include product + variant detail)
- `POST /cart` — tambah item `{ variantId, quantity }`
- `PUT /cart/:itemId` — update kuantitas
- `DELETE /cart/:itemId` — hapus satu item
- `DELETE /cart` — kosongkan keranjang
- `POST /cart/validate` — cek stok semua item (panggil sebelum checkout)

Catatan penting:
- Cek stok variant sebelum tambah ke cart. Jika stok < quantity → `BusinessError`
- Jika variant sudah ada di cart → update quantity (jangan duplicate row)
- Cart disimpan di database (`cart_items`), bukan di Redis

**Wishlist (`/api/v1/wishlist`):**
- `GET /wishlist` — list produk di wishlist
- `POST /wishlist` — tambah `{ productId }`
- `DELETE /wishlist/:productId` — hapus dari wishlist
- Toggle logic: jika sudah ada → hapus, belum ada → tambah

**Search (`/api/v1/products?q=xxx`):**
- Sudah ada di M2, pastikan berfungsi dengan benar
- Tambahkan endpoint `GET /api/v1/products/search/suggestions?q=xxx` untuk autocomplete (max 5 hasil, hanya nama produk)
- Cache suggestion di Redis: key `search:suggestions:${q}`, TTL 10 menit

### Frontend — buat halaman/komponen:
- `CartIcon` di Navbar: tampilkan badge count dari Zustand cart store
- `/cart` page: list item, update qty, hapus, subtotal
- Wishlist button di ProductCard (toggle, sync ke API)
- `/wishlist` page: grid produk wishlist

### Install (jika belum ada):
```bash
# Tidak ada dependency baru yang signifikan untuk M3
```

### Verifikasi M3:
- [ ] Tambah produk ke cart → stok berkurang di response validate
- [ ] Cart persisten setelah logout + login kembali
- [ ] Wishlist toggle berfungsi
- [ ] Autocomplete search mengembalikan hasil dalam < 300ms

---

## M4 — Checkout, Ongkir & Pembayaran Midtrans

**Tujuan:** User bisa checkout, pilih pengiriman, dan bayar via Midtrans Snap.

### Backend — buat modul:

**Alamat (`/api/v1/users/addresses`):**
- CRUD alamat pengiriman (sudah terdefinisi di M2 auth module, pindahkan ke modul users)
- Max 5 alamat per user
- `PATCH /users/addresses/:id/default` — set alamat default

**Checkout (`/api/v1/checkout`):**
- `POST /checkout/shipping-cost` — kalkulasi ongkir via RajaOngkir API
  - Input: `{ addressId, items: [{ variantId, quantity }] }`
  - Panggil RajaOngkir API dengan berat total + kota asal/tujuan
  - Return: list kurir + layanan + harga + estimasi
- `POST /checkout/voucher/validate` — validasi kode voucher
  - Cek: kode ada, belum expired, belum habis max uses, memenuhi min purchase

**Order (`/api/v1/orders`):**
- `POST /orders` — buat order baru (proses checkout)
  - Validasi stok semua item (gunakan Prisma transaction)
  - Buat record `Order` + `OrderItem`
  - Kurangi stok setiap variant
  - Kosongkan cart user
  - Tandai voucher sebagai digunakan (increment `usedCount`)
  - Panggil Midtrans untuk generate `snap_token`
  - Return: `{ orderNumber, snapToken, totalAmount }`
- `GET /orders` — list order milik user (filter by status, pagination)
- `GET /orders/:orderNumber` — detail order lengkap
- `POST /orders/:orderNumber/cancel` — batalkan order (hanya jika `pending_payment` atau `processing`)

**Payment (`/api/v1/payments`):**
- `POST /payments/webhook/midtrans` — webhook dari Midtrans (PUBLIC, verifikasi signature)
  - Verifikasi: `SHA512(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)`
  - Update status `Payment` dan `Order` berdasarkan notifikasi
  - Jika `settlement` → order status: `paid`, kirim email konfirmasi
  - Jika `expire` → order status: `cancelled`, kembalikan stok
- `GET /payments/:orderId/status` — cek status pembayaran

**Setup Midtrans:**
```bash
pnpm add midtrans-client
```
```typescript
// apps/api/src/lib/midtrans.ts
import midtransClient from 'midtrans-client';
export const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});
```

**Setup RajaOngkir:**
```bash
pnpm add axios  # jika belum ada, untuk call RajaOngkir API
```
```typescript
// apps/api/src/lib/rajaongkir.ts
// Wrapper untuk RajaOngkir API
// Endpoint: POST /cost (hitung ongkir)
// Cache hasil di Redis: key `ongkir:${origin}:${destination}:${weight}`, TTL 30 menit
```

**Order expiry job:**
- Buat job sederhana yang berjalan setiap 15 menit (gunakan `setInterval` atau `node-cron`)
- Query order dengan status `pending_payment` dan `createdAt` > 24 jam lalu
- Auto-cancel dan kembalikan stok
```bash
pnpm add node-cron && pnpm add -D @types/node-cron
```

### Frontend — buat halaman:
- `/checkout` — 3-step: Alamat → Pengiriman → Pembayaran
- Integrasi Midtrans Snap di frontend:
  ```html
  <!-- Di app/layout.tsx atau checkout page -->
  <Script src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />
  ```
  ```typescript
  // Trigger Snap popup
  window.snap.pay(snapToken, {
    onSuccess: (result) => router.push(`/checkout/success/${orderNumber}`),
    onPending: (result) => router.push(`/orders/${orderNumber}`),
    onError: (result) => toast.error('Pembayaran gagal'),
  });
  ```
- `/checkout/success/[orderNumber]` — halaman konfirmasi sukses
- `/orders` — list order user
- `/orders/[orderNumber]` — detail order + status timeline

### Verifikasi M4:
- [ ] Kalkulasi ongkir mengembalikan pilihan kurir
- [ ] Voucher valid mengurangi total harga
- [ ] Order berhasil dibuat + stok berkurang
- [ ] Midtrans Snap popup terbuka setelah checkout
- [ ] Webhook Midtrans memperbarui status order secara otomatis
- [ ] Order expired 24 jam → otomatis cancelled + stok kembali

---

## M5 — Manajemen Order & Notifikasi Email

**Tujuan:** Seller bisa kelola order, input resi, dan user menerima notifikasi email.

### Backend:

**Update Order (Seller/Admin):**
- `PUT /admin/orders/:id/status` — update status order
  - Allowed transitions: `paid→processing`, `processing→shipped`, `shipped→delivered`
- `PUT /admin/orders/:id/tracking` — input nomor resi `{ trackingNumber, courier }`

**Konfirmasi Penerima (Buyer):**
- `POST /orders/:orderNumber/confirm-received` — buyer konfirmasi terima barang
  - Update status order ke `delivered`
  - Set `deliveredAt = now()`

**Return Request:**
- `POST /orders/:orderNumber/return` — ajukan return `{ reason, images? }`
  - Hanya bisa jika status `delivered` dan dalam 7 hari setelah `deliveredAt`
- `PUT /admin/returns/:id` — admin approve/reject return `{ status, adminNotes }`

**Email Notifications (Nodemailer):**

Buat `apps/api/src/lib/mailer.ts` dan `apps/api/src/lib/emailTemplates.ts`.

Email yang harus dikirim:
1. **Verifikasi email** — setelah register (sudah ada di M2, pastikan berfungsi)
2. **Order berhasil dibayar** — include nomor order, list produk, total, estimasi pengiriman
3. **Order dikirim** — include nomor resi + kurir
4. **Order dibatalkan** — include alasan pembatalan

Format email: HTML template sederhana, tidak perlu library khusus.
Kirim email secara async — jangan blocking request utama:
```typescript
// Fire and forget — jangan await di controller
mailer.sendOrderConfirmation(order, user).catch(logger.error);
```

**In-App Notifications:**
- Buat helper `createNotification(userId, type, title, message, data?)` 
- Panggil setiap kali ada event penting (order paid, shipped, dll.)
- `GET /users/notifications` — list notifikasi user (unread dulu)
- `PUT /users/notifications/:id/read` — tandai dibaca
- `PUT /users/notifications/read-all` — tandai semua dibaca

### Frontend:
- Notification bell di Navbar: badge unread count, dropdown list notifikasi
- Di halaman `/orders/[orderNumber]`: tampilkan status timeline (pending → paid → processing → shipped → delivered)
- Tombol "Konfirmasi Penerima" jika status `shipped`
- Tombol "Ajukan Return" jika status `delivered` dan dalam 7 hari

### Verifikasi M5:
- [ ] Email konfirmasi order terkirim setelah pembayaran
- [ ] Email notifikasi pengiriman terkirim saat seller input resi
- [ ] Tombol konfirmasi penerima mengubah status ke `delivered`
- [ ] Return request bisa diajukan dalam 7 hari

---

## M6 — Admin Dashboard & Laporan

**Tujuan:** Admin bisa melihat overview bisnis, kelola user/produk/order, dan export laporan.

### Backend:

**Dashboard KPI (`GET /admin/dashboard`):**
```typescript
// Return dalam satu query:
{
  revenue: { today, thisMonth, lastMonth, percentChange },
  orders: { today, thisMonth, byStatus },
  products: { total, active, outOfStock },
  users: { total, newThisMonth },
  topProducts: [...],   // top 5 by soldCount
  recentOrders: [...],  // 10 order terbaru
  salesChart: [...]     // revenue per hari 30 hari terakhir
}
// Cache di Redis: key 'admin:dashboard', TTL 5 menit
```

**Manajemen User (`/admin/users`):**
- `GET /admin/users` — list semua user (filter: role, status, search by name/email)
- `PATCH /admin/users/:id/status` — suspend/aktifkan akun `{ isActive: boolean }`
- `PATCH /admin/users/:id/role` — ubah role (hanya super_admin)

**Manajemen Produk (`/admin/products`):**
- `GET /admin/products` — list semua produk (termasuk milik semua seller)
- `PATCH /admin/products/:id/approve` — approve/reject produk seller `{ isApproved: boolean }`

**Manajemen Order (`/admin/orders`):**
- `GET /admin/orders` — list semua order (filter: status, dateRange, search by orderNumber)
- Gunakan endpoint yang sudah ada di M5, tambahkan filter lebih lengkap

**Voucher (`/admin/vouchers`):**
- `GET /admin/vouchers` — list semua voucher
- `POST /admin/vouchers` — buat voucher baru
- `PATCH /admin/vouchers/:id` — edit / nonaktifkan voucher

**Laporan (`/admin/reports`):**
- `GET /admin/reports/sales` — data penjualan dengan filter tanggal
  - Query params: `?startDate=2026-01-01&endDate=2026-01-31&groupBy=day|week|month`
- `GET /admin/reports/sales/export` — export ke CSV
  - Gunakan library `json2csv` untuk convert data ke CSV
  - Set header: `Content-Type: text/csv`, `Content-Disposition: attachment; filename=laporan-penjualan.csv`

```bash
pnpm add json2csv && pnpm add -D @types/json2csv
```

### Frontend — buat halaman admin (route group `app/(admin)/admin/`):

Layout admin harus menggunakan `AdminSidebar` (sudah digenerate dari v0.dev di awal).
Semua halaman admin wajib ada middleware proteksi role `admin`/`super_admin`.

Halaman yang dibuat:
- `/admin` — Dashboard dengan KPI cards + chart Recharts + tabel order terbaru
- `/admin/users` — DataTable user dengan filter + tombol suspend
- `/admin/products` — DataTable produk dengan tombol approve/reject
- `/admin/orders` — DataTable order dengan update status + input resi
- `/admin/vouchers` — List voucher + form buat baru
- `/admin/reports` — Chart penjualan + tombol export CSV

**Proteksi route admin di Next.js:**
```typescript
// middleware.ts (root project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek role dari cookie/token untuk route /admin/*
  // Redirect ke /login jika tidak authorized
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
```

### Verifikasi M6:
- [ ] Dashboard menampilkan KPI yang akurat
- [ ] Admin bisa approve produk seller
- [ ] Admin bisa update status order + input resi
- [ ] Export CSV laporan penjualan berfungsi
- [ ] Route `/admin/*` tidak bisa diakses oleh role `buyer`

---

## CATATAN UNTUK AGENT

1. **Jangan memulai phase baru sebelum verifikasi phase sebelumnya lulus semua.**
2. **Selalu refer ke `prd.md` untuk detail requirement** yang tidak ada di sini.
3. **Selalu refer ke `rules.md` untuk coding standards** — terutama bagian Security Rules dan Error Handling.
4. **Jangan buat komponen UI dari nol** — cek `component-registry.md` dulu, gunakan yang sudah ada.
5. **Setiap selesai satu phase**, buat file `walkthrough-m[X].md` yang merangkum semua perubahan (ikuti format walkthrough M1 yang sudah ada).
