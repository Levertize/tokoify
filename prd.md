# 📦 PRD — Aplikasi E-Commerce Full-Stack Modern
**Version:** 1.0.0  
**Last Updated:** 2026-06-01  
**Status:** Ready for Development  
**Owner:** Product Team  

---

## 📋 Daftar Isi
1. [Overview & Tujuan](#1-overview--tujuan)
2. [User Personas](#2-user-personas)
3. [Fitur & Requirement Fungsional](#3-fitur--requirement-fungsional)
4. [Arsitektur Teknis](#4-arsitektur-teknis)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Alur Bisnis (User Flow)](#7-alur-bisnis-user-flow)
8. [UI/UX Requirements](#8-uiux-requirements)
9. [Keamanan (Security)](#9-keamanan-security)
10. [Performa & Skalabilitas](#10-performa--skalabilitas)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Milestone & Timeline](#12-milestone--timeline)
13. [Acceptance Criteria](#13-acceptance-criteria)

---

## 1. Overview & Tujuan

### 1.1 Deskripsi Produk
Platform e-commerce full-stack modern yang memungkinkan penjual mendaftarkan produk dan pembeli melakukan transaksi secara aman. Aplikasi ini mencakup seluruh lifecycle transaksi: dari browse katalog → keranjang belanja → checkout → pembayaran → konfirmasi pesanan → manajemen order.

### 1.2 Tujuan Bisnis
- Membangun platform toko online yang skalabel dan aman
- Membuktikan penguasaan end-to-end engineering: auth, transaksi finansial, database, dan deployment
- Mendukung multiple payment method (kartu kredit via Midtrans, transfer bank, dompet digital)
- Menyediakan admin dashboard untuk manajemen produk, order, dan laporan penjualan

### 1.3 Target Pengguna
| Segmen | Deskripsi |
|---|---|
| Pembeli (Buyer) | Pengguna yang ingin berbelanja produk secara online |
| Penjual (Seller/Admin) | Pengelola toko yang mengatur katalog dan pesanan |
| Super Admin | Tim internal yang mengelola platform secara keseluruhan |

### 1.4 Success Metrics
- Checkout completion rate ≥ 80%
- Page load time ≤ 2 detik (LCP)
- Uptime 99.9%
- Payment success rate ≥ 95%
- Zero critical security vulnerabilities

---

## 2. User Personas

### 2.1 Persona: Budi (Pembeli)
- **Usia:** 25–40 tahun
- **Kebiasaan:** Berbelanja via mobile, menggunakan dompet digital (GoPay, OVO)
- **Kebutuhan:** Checkout cepat, UI yang bersih, konfirmasi order real-time
- **Pain Point:** Proses checkout terlalu panjang, tidak ada status tracking pesanan

### 2.2 Persona: Sari (Penjual/Admin Toko)
- **Usia:** 28–45 tahun
- **Kebiasaan:** Mengelola stok dan harga dari desktop
- **Kebutuhan:** Dashboard mudah dipahami, laporan penjualan harian/bulanan
- **Pain Point:** Manajemen stok yang ribet, tidak ada notifikasi order masuk

### 2.3 Persona: Super Admin (Tim IT)
- **Usia:** 22–35 tahun
- **Kebiasaan:** Akses full ke semua data dan konfigurasi platform
- **Kebutuhan:** Manajemen user, konfigurasi payment gateway, audit log

---

## 3. Fitur & Requirement Fungsional

### 3.1 Modul Autentikasi & Otorisasi

#### FR-AUTH-01: Registrasi User
- User dapat mendaftar dengan email, password, nama lengkap
- Validasi format email dan kekuatan password (min 8 karakter, ada huruf besar, angka, simbol)
- Kirim email verifikasi setelah registrasi
- Akun tidak aktif sampai email diverifikasi
- Dukung OAuth 2.0 (Google Sign-In) sebagai alternatif

#### FR-AUTH-02: Login
- Login menggunakan email + password
- Implementasi JWT Access Token (expire: 15 menit) + Refresh Token (expire: 7 hari)
- Refresh token disimpan di HttpOnly Cookie (bukan localStorage)
- Fitur "Remember Me" memperpanjang refresh token menjadi 30 hari
- Lockout akun setelah 5 kali gagal login (cooldown 15 menit)
- Login via Google OAuth 2.0

#### FR-AUTH-03: Manajemen Sesi
- Auto-refresh access token menggunakan refresh token
- Logout invalidasi refresh token di server
- Logout dari semua perangkat (revoke semua session)
- Tampilkan daftar sesi aktif di halaman profile

#### FR-AUTH-04: Reset Password
- Kirim link reset password ke email (expire: 1 jam)
- Token reset hanya bisa digunakan satu kali
- Notifikasi email setelah password berhasil diganti

#### FR-AUTH-05: Role & Permission
| Role | Akses |
|---|---|
| `buyer` | Browse produk, cart, checkout, lihat order sendiri |
| `seller` | Semua akses buyer + kelola produk & stok milik sendiri |
| `admin` | Semua akses seller + kelola semua user & order |
| `super_admin` | Full access + konfigurasi platform |

---

### 3.2 Modul Produk (Katalog)

#### FR-PRODUCT-01: Tampilan Katalog
- Grid/list view produk dengan infinite scroll atau pagination (20 item/halaman)
- Filter berdasarkan: kategori, harga (range), rating, ketersediaan stok
- Sort berdasarkan: terbaru, harga terendah/tertinggi, terlaris, rating tertinggi
- Tampilkan badge: "Diskon", "Baru", "Habis Terjual"

#### FR-PRODUCT-02: Halaman Detail Produk
- Foto produk (multiple image, zoom on hover/tap)
- Nama, harga, harga sebelum diskon (jika ada), persentase diskon
- Deskripsi produk (rich text / HTML)
- Varian produk (ukuran, warna, dll.) — setiap varian punya stok & harga sendiri
- Rating & Review section
- Estimasi pengiriman
- Tombol "Tambah ke Keranjang" dan "Beli Sekarang"
- Produk terkait / rekomendasi (berdasarkan kategori sama)

#### FR-PRODUCT-03: Pencarian
- Search bar dengan autocomplete (debounce 300ms)
- Full-text search pada nama & deskripsi produk
- Highlight keyword pada hasil pencarian
- Simpan riwayat pencarian (per user, max 10 item)
- Saran pencarian populer

#### FR-PRODUCT-04: Manajemen Produk (Seller/Admin)
- CRUD produk: tambah, edit, hapus (soft delete)
- Upload multiple foto produk (max 5 foto, max 2MB per foto)
- Atur varian produk dengan stok dan harga masing-masing
- Bulk update harga/stok via CSV upload
- Aktifkan/nonaktifkan produk tanpa menghapus
- Preview halaman produk sebelum publish

#### FR-PRODUCT-05: Kategori & Tag
- Kategori hierarkis (maksimal 2 level: Kategori → Sub-Kategori)
- Tagging produk untuk pencarian yang lebih fleksibel
- Halaman kategori dengan filter lanjutan

---

### 3.3 Modul Keranjang Belanja (Shopping Cart)

#### FR-CART-01: Operasi Keranjang
- Tambah produk ke keranjang (dengan varian yang dipilih)
- Update kuantitas item di keranjang
- Hapus item dari keranjang
- Keranjang persisten: disimpan di database (bukan hanya localStorage)
- Sinkronisasi keranjang antar perangkat setelah login
- Guest cart: user belum login tetap bisa menambah ke keranjang, lalu merge saat login

#### FR-CART-02: Tampilan Keranjang
- Preview mini cart di navbar (dropdown)
- Halaman full cart dengan detail item, subtotal, estimasi ongkos kirim
- Validasi stok real-time saat checkout (cegah beli produk yang habis)
- Notifikasi jika stok item berkurang / habis saat di keranjang
- Simpan untuk nanti (Move to Wishlist)

#### FR-CART-03: Voucher & Diskon
- Input kode voucher/kupon
- Validasi: kode valid, belum expired, memenuhi minimum pembelian
- Tampilkan potongan harga secara real-time
- Satu transaksi hanya bisa menggunakan satu voucher
- Diskon otomatis (flash sale) tanpa perlu input kode

---

### 3.4 Modul Checkout & Pembayaran

#### FR-CHECKOUT-01: Alur Checkout
Alur 3 langkah:
1. **Alamat** — Pilih / tambah alamat pengiriman
2. **Pengiriman** — Pilih kurir & metode pengiriman
3. **Pembayaran** — Pilih metode bayar & konfirmasi

#### FR-CHECKOUT-02: Alamat Pengiriman
- User dapat menyimpan multiple alamat (max 5)
- Satu alamat sebagai default
- Form: nama penerima, nomor HP, provinsi, kota, kecamatan, kode pos, detail alamat
- Integrasi API RajaOngkir / Shipper untuk daftar wilayah Indonesia
- Validasi kelengkapan alamat sebelum lanjut

#### FR-CHECKOUT-03: Pengiriman
- Kalkulasi ongkos kirim otomatis via API RajaOngkir/Shipper
- Tampilkan pilihan kurir (JNE, J&T, SiCepat, Anteraja, Gosend)
- Pilihan layanan per kurir (REG, YES, OKE, dll.)
- Estimasi tiba berdasarkan kurir yang dipilih
- Gratis ongkir jika memenuhi syarat (konfigurasi admin)

#### FR-CHECKOUT-04: Payment Gateway (Midtrans)
Metode pembayaran yang didukung:
- **Virtual Account:** BCA, BNI, BRI, Mandiri, Permata
- **E-Wallet:** GoPay, OVO, DANA, ShopeePay
- **QRIS:** Universal QR code
- **Kartu Kredit/Debit:** Visa, Mastercard (via Midtrans Snap)
- **Convenience Store:** Alfamart, Indomaret
- **Cicilan:** Kartu kredit 3/6/12 bulan (jika diaktifkan)

#### FR-CHECKOUT-05: Proses Pembayaran
- Integrasi Midtrans Snap (popup atau redirect mode)
- Order dibuat di database saat checkout dikonfirmasi (status: `pending_payment`)
- Midtrans Webhook menerima notifikasi pembayaran real-time
- Status order diupdate otomatis: `pending_payment` → `paid` → `processing` → `shipped` → `delivered`
- Jika pembayaran gagal/expired (24 jam), order otomatis dibatalkan dan stok dikembalikan
- Kirim email konfirmasi + invoice PDF setelah pembayaran berhasil

---

### 3.5 Modul Order Management

#### FR-ORDER-01: Tampilan Order (Buyer)
- Daftar order dengan filter status dan pencarian nomor order
- Detail order: daftar produk, total harga, resi pengiriman, status timeline
- Tracking pesanan (terintegrasi dengan nomor resi)
- Tombol "Konfirmasi Penerima" setelah barang diterima
- Tombol "Batalkan Order" (hanya jika status masih `pending_payment` atau `processing`)
- Download invoice PDF

#### FR-ORDER-02: Manajemen Order (Seller/Admin)
- Dashboard order dengan filter: semua, perlu diproses, dikirim, selesai, dibatalkan
- Update status order dan input nomor resi pengiriman
- Cetak label pengiriman
- Notifikasi order masuk (in-app + email)
- Batch update status multiple order

#### FR-ORDER-03: Return & Refund
- Buyer dapat request return dalam 7 hari setelah konfirmasi penerimaan
- Upload foto bukti produk bermasalah
- Admin review dan approval request return
- Proses refund ke metode pembayaran asal (via Midtrans Refund API)
- Status return: `requested` → `approved` → `refunded` / `rejected`

---

### 3.6 Modul Review & Rating

#### FR-REVIEW-01: Buat Review
- Hanya buyer yang sudah menerima produk dapat memberikan review
- Rating bintang 1–5
- Ulasan teks (opsional, min 10 karakter jika diisi)
- Upload foto (opsional, max 3 foto)
- Satu review per produk per order

#### FR-REVIEW-02: Tampilan Review
- Rata-rata rating dengan distribusi bintang (bar chart)
- Filter review: semua, dengan foto, per bintang
- Sort review: terbaru, terlama, rating tertinggi/terendah
- Pagination review (10 per halaman)
- Tandai review sebagai "Membantu" (helpful)

---

### 3.7 Modul Wishlist

- Tambah/hapus produk ke wishlist (tanpa harus pilih varian)
- Halaman wishlist menampilkan produk tersimpan
- Notifikasi jika produk di wishlist sedang diskon
- Move to Cart langsung dari wishlist

---

### 3.8 Admin Dashboard

#### FR-ADMIN-01: Overview Dashboard
- KPI cards: Total Revenue, Total Orders, Produk Aktif, User Terdaftar (hari ini / bulan ini)
- Grafik penjualan harian/mingguan/bulanan (line chart)
- Grafik order per status (pie chart)
- Tabel top 5 produk terlaris
- Tabel order terbaru

#### FR-ADMIN-02: Manajemen User
- Daftar semua user dengan filter role dan status
- Lihat detail profil user + riwayat order
- Suspend / aktifkan akun user
- Ubah role user (hanya super_admin)

#### FR-ADMIN-03: Manajemen Produk
- Daftar semua produk dengan filter kategori, status, stok
- Approve / reject produk yang disubmit seller
- Edit produk apapun
- Kelola kategori dan sub-kategori

#### FR-ADMIN-04: Manajemen Voucher
- Buat voucher: kode unik atau generate otomatis
- Konfigurasi: tipe diskon (persen/nominal), minimum pembelian, max penggunaan, tanggal berlaku
- Statistik penggunaan voucher

#### FR-ADMIN-05: Laporan
- Export laporan penjualan ke CSV/Excel
- Filter berdasarkan rentang tanggal, kategori, produk
- Laporan stok (produk hampir habis)
- Laporan transaksi pembayaran (reconciliation)

---

### 3.9 Modul Notifikasi

- In-app notification (bell icon di navbar)
- Email notification (menggunakan Nodemailer + SMTP / SendGrid)
- Trigger notifikasi:
  - Registrasi berhasil (verifikasi email)
  - Order berhasil dibayar
  - Status order berubah
  - Pesanan dikirim (+ nomor resi)
  - Review baru pada produk (ke seller)
  - Produk di wishlist sedang diskon
  - Stok hampir habis (ke seller/admin)

---

## 4. Arsitektur Teknis

### 4.1 Tech Stack

#### Frontend
| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand (client) + TanStack Query (server state) |
| Form Handling | React Hook Form + Zod |
| Image Optimization | next/image |
| Icons | Lucide React |

#### Backend
| Layer | Teknologi |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js atau Fastify |
| Language | TypeScript |
| ORM | Prisma |
| Validation | Zod |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer + Gmail SMTP / SendGrid |
| Queue | BullMQ + Redis (untuk background jobs) |

#### Database
| Layer | Teknologi |
|---|---|
| Primary DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Search | PostgreSQL Full-Text Search (atau Elasticsearch untuk skala besar) |
| File Storage | Cloudinary (gambar produk) |

#### Infrastructure & DevOps
| Layer | Teknologi |
|---|---|
| Containerization | Docker + Docker Compose |
| Deployment | Railway / Render / VPS (DigitalOcean) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (error tracking) + Uptime Kuma |
| SSL | Let's Encrypt via Certbot |

#### Payment & Third-Party
| Service | Provider |
|---|---|
| Payment Gateway | Midtrans (Snap) |
| SMS/WhatsApp | Twilio / Fonnte (opsional) |
| Ongkir API | RajaOngkir / Binderbyte |
| OAuth | Google OAuth 2.0 |

---

### 4.2 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  Next.js 14 (SSR + CSR)  │  Mobile Browser             │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────────┐
│                    API GATEWAY / NGINX                  │
│         Rate Limiting │ SSL Termination │ Load Balance  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   BACKEND SERVICES                      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Auth API   │  │ Product API │  │   Order API     │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│  ┌──────▼──────────────────────────────────▼─────────┐ │
│  │              Background Jobs (BullMQ)              │ │
│  │   Email Queue │ Notification │ Order Expiry        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                    DATA LAYER                           │
│  PostgreSQL 16  │  Redis 7  │  Cloudinary (Files)       │
└─────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│               EXTERNAL SERVICES                         │
│  Midtrans  │  RajaOngkir  │  Google OAuth  │  SendGrid  │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Struktur Folder Proyek

```
ecommerce-app/
├── apps/
│   ├── web/                        # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── (shop)/
│   │   │   │   ├── page.tsx        # Homepage
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── orders/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   └── products/
│   │   │   └── (admin)/
│   │   │       └── admin/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── store/                  # Zustand stores
│   │   └── types/
│   │
│   └── api/                        # Express/Fastify Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── products/
│       │   │   ├── categories/
│       │   │   ├── cart/
│       │   │   ├── orders/
│       │   │   ├── payments/
│       │   │   ├── reviews/
│       │   │   ├── wishlist/
│       │   │   ├── vouchers/
│       │   │   └── notifications/
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rateLimit.middleware.ts
│       │   │   ├── upload.middleware.ts
│       │   │   └── errorHandler.middleware.ts
│       │   ├── config/
│       │   ├── utils/
│       │   ├── jobs/               # BullMQ Jobs
│       │   └── types/
│       └── prisma/
│           ├── schema.prisma
│           ├── migrations/
│           └── seed.ts
│
├── packages/
│   ├── shared-types/               # Types yang dishare frontend-backend
│   └── ui/                         # Shared UI components (opsional)
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 5. Database Schema

### 5.1 ERD Overview

```
users ──< sessions
users ──< addresses
users ──< orders ──< order_items ──> product_variants
users ──< reviews ──> products
users ──< cart_items ──> product_variants
users ──< wishlists ──> products
products ──< product_images
products ──< product_variants
products >── categories
orders >── vouchers
orders ──< payments
orders ──< return_requests
```

### 5.2 Tabel Detail

```sql
-- USERS
Table users {
  id           UUID        [pk, default: gen_random_uuid()]
  email        VARCHAR(255) [unique, not null]
  password     VARCHAR(255) [null]          -- null jika OAuth
  name         VARCHAR(255) [not null]
  phone        VARCHAR(20)  [null]
  avatar       TEXT         [null]
  role         ENUM('buyer','seller','admin','super_admin') [default: 'buyer']
  is_verified  BOOLEAN      [default: false]
  is_active    BOOLEAN      [default: true]
  google_id    VARCHAR(255) [null, unique]
  created_at   TIMESTAMP    [default: now()]
  updated_at   TIMESTAMP    [default: now()]
}

-- SESSIONS (Refresh Token)
Table sessions {
  id           UUID        [pk]
  user_id      UUID        [ref: > users.id]
  token        TEXT        [unique, not null]
  device_info  VARCHAR(500)[null]
  ip_address   VARCHAR(50) [null]
  expires_at   TIMESTAMP   [not null]
  created_at   TIMESTAMP   [default: now()]
}

-- EMAIL VERIFICATIONS
Table email_verifications {
  id         UUID      [pk]
  user_id    UUID      [ref: > users.id]
  token      VARCHAR(255) [unique, not null]
  expires_at TIMESTAMP [not null]
  used_at    TIMESTAMP [null]
  created_at TIMESTAMP [default: now()]
}

-- ADDRESSES
Table addresses {
  id              UUID        [pk]
  user_id         UUID        [ref: > users.id]
  label           VARCHAR(100)[null]        -- "Rumah", "Kantor"
  recipient_name  VARCHAR(255)[not null]
  phone           VARCHAR(20) [not null]
  province        VARCHAR(100)[not null]
  province_id     VARCHAR(10) [not null]
  city            VARCHAR(100)[not null]
  city_id         VARCHAR(10) [not null]
  district        VARCHAR(100)[not null]
  postal_code     VARCHAR(10) [not null]
  detail          TEXT        [not null]
  is_default      BOOLEAN     [default: false]
  created_at      TIMESTAMP   [default: now()]
}

-- CATEGORIES
Table categories {
  id          UUID        [pk]
  name        VARCHAR(255)[not null]
  slug        VARCHAR(255)[unique, not null]
  description TEXT        [null]
  image       TEXT        [null]
  parent_id   UUID        [null, ref: > categories.id]
  is_active   BOOLEAN     [default: true]
  sort_order  INTEGER     [default: 0]
  created_at  TIMESTAMP   [default: now()]
}

-- PRODUCTS
Table products {
  id            UUID        [pk]
  seller_id     UUID        [ref: > users.id]
  category_id   UUID        [ref: > categories.id]
  name          VARCHAR(500)[not null]
  slug          VARCHAR(500)[unique, not null]
  description   TEXT        [not null]
  base_price    DECIMAL(15,2)[not null]
  is_active     BOOLEAN     [default: true]
  is_approved   BOOLEAN     [default: false]
  weight        INTEGER     [not null]      -- gram
  avg_rating    DECIMAL(3,2)[default: 0]
  review_count  INTEGER     [default: 0]
  sold_count    INTEGER     [default: 0]
  tags          TEXT[]      [null]
  created_at    TIMESTAMP   [default: now()]
  updated_at    TIMESTAMP   [default: now()]
  deleted_at    TIMESTAMP   [null]          -- soft delete
}

-- PRODUCT VARIANTS
Table product_variants {
  id          UUID         [pk]
  product_id  UUID         [ref: > products.id]
  sku         VARCHAR(100) [unique, not null]
  options     JSONB        [not null]    -- {"color":"Merah","size":"XL"}
  price       DECIMAL(15,2)[not null]
  stock       INTEGER      [not null, default: 0]
  is_active   BOOLEAN      [default: true]
  created_at  TIMESTAMP    [default: now()]
}

-- PRODUCT IMAGES
Table product_images {
  id          UUID    [pk]
  product_id  UUID    [ref: > products.id]
  url         TEXT    [not null]
  alt_text    VARCHAR(255)[null]
  is_primary  BOOLEAN [default: false]
  sort_order  INTEGER [default: 0]
  created_at  TIMESTAMP[default: now()]
}

-- CART ITEMS
Table cart_items {
  id          UUID    [pk]
  user_id     UUID    [ref: > users.id]
  variant_id  UUID    [ref: > product_variants.id]
  quantity    INTEGER [not null, default: 1]
  created_at  TIMESTAMP[default: now()]
  updated_at  TIMESTAMP[default: now()]
  [unique: user_id, variant_id]
}

-- WISHLISTS
Table wishlists {
  id          UUID [pk]
  user_id     UUID [ref: > users.id]
  product_id  UUID [ref: > products.id]
  created_at  TIMESTAMP[default: now()]
  [unique: user_id, product_id]
}

-- VOUCHERS
Table vouchers {
  id              UUID         [pk]
  code            VARCHAR(50)  [unique, not null]
  type            ENUM('percentage','fixed') [not null]
  value           DECIMAL(15,2)[not null]
  min_purchase    DECIMAL(15,2)[default: 0]
  max_discount    DECIMAL(15,2)[null]    -- cap untuk tipe percentage
  max_uses        INTEGER      [null]    -- null = unlimited
  used_count      INTEGER      [default: 0]
  starts_at       TIMESTAMP    [not null]
  expires_at      TIMESTAMP    [not null]
  is_active       BOOLEAN      [default: true]
  created_at      TIMESTAMP    [default: now()]
}

-- ORDERS
Table orders {
  id                  UUID            [pk]
  order_number        VARCHAR(50)     [unique, not null]   -- ORD-20260601-XXXX
  user_id             UUID            [ref: > users.id]
  voucher_id          UUID            [null, ref: > vouchers.id]
  address_snapshot    JSONB           [not null]   -- alamat saat order dibuat
  subtotal            DECIMAL(15,2)   [not null]
  shipping_cost       DECIMAL(15,2)   [not null]
  discount_amount     DECIMAL(15,2)   [default: 0]
  total_amount        DECIMAL(15,2)   [not null]
  courier             VARCHAR(50)     [not null]
  courier_service     VARCHAR(50)     [not null]
  tracking_number     VARCHAR(100)    [null]
  status              ENUM('pending_payment','paid','processing','shipped','delivered','cancelled','refunded') [default: 'pending_payment']
  cancel_reason       TEXT            [null]
  notes               TEXT            [null]
  paid_at             TIMESTAMP       [null]
  shipped_at          TIMESTAMP       [null]
  delivered_at        TIMESTAMP       [null]
  created_at          TIMESTAMP       [default: now()]
  updated_at          TIMESTAMP       [default: now()]
}

-- ORDER ITEMS
Table order_items {
  id              UUID         [pk]
  order_id        UUID         [ref: > orders.id]
  variant_id      UUID         [ref: > product_variants.id]
  product_snapshot JSONB       [not null]  -- snapshot nama, harga saat order
  quantity        INTEGER      [not null]
  unit_price      DECIMAL(15,2)[not null]
  total_price     DECIMAL(15,2)[not null]
}

-- PAYMENTS
Table payments {
  id                  UUID         [pk]
  order_id            UUID         [unique, ref: > orders.id]
  midtrans_order_id   VARCHAR(100) [unique, not null]
  midtrans_txn_id     VARCHAR(100) [null]
  payment_type        VARCHAR(50)  [null]
  payment_code        VARCHAR(100) [null]  -- VA number, QRIS url
  gross_amount        DECIMAL(15,2)[not null]
  status              ENUM('pending','success','failed','expired','cancelled','refund') [default: 'pending']
  midtrans_response   JSONB        [null]  -- raw response dari Midtrans
  expires_at          TIMESTAMP    [null]
  paid_at             TIMESTAMP    [null]
  created_at          TIMESTAMP    [default: now()]
  updated_at          TIMESTAMP    [default: now()]
}

-- REVIEWS
Table reviews {
  id            UUID    [pk]
  user_id       UUID    [ref: > users.id]
  product_id    UUID    [ref: > products.id]
  order_item_id UUID    [unique, ref: > order_items.id]
  rating        SMALLINT[not null]   -- 1-5
  comment       TEXT    [null]
  images        TEXT[]  [null]
  helpful_count INTEGER [default: 0]
  is_visible    BOOLEAN [default: true]
  created_at    TIMESTAMP[default: now()]
}

-- NOTIFICATIONS
Table notifications {
  id         UUID      [pk]
  user_id    UUID      [ref: > users.id]
  type       VARCHAR(50)[not null]
  title      VARCHAR(255)[not null]
  message    TEXT      [not null]
  data       JSONB     [null]
  is_read    BOOLEAN   [default: false]
  created_at TIMESTAMP [default: now()]
}

-- RETURN REQUESTS
Table return_requests {
  id           UUID   [pk]
  order_id     UUID   [ref: > orders.id]
  user_id      UUID   [ref: > users.id]
  reason       TEXT   [not null]
  images       TEXT[] [null]
  status       ENUM('requested','approved','rejected','refunded') [default: 'requested']
  admin_notes  TEXT   [null]
  refund_amount DECIMAL(15,2)[null]
  created_at   TIMESTAMP[default: now()]
  updated_at   TIMESTAMP[default: now()]
}
```

### 5.3 Indeks Database

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_is_active ON products(is_active, is_approved);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('indonesian', name || ' ' || description));

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Cart
CREATE INDEX idx_cart_user_id ON cart_items(user_id);

-- Notifications
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);
```

---

## 6. API Endpoints

### 6.1 Konvensi API
- Base URL: `/api/v1`
- Format: JSON
- Autentikasi: `Authorization: Bearer <access_token>`
- Error format:
```json
{
  "success": false,
  "message": "Deskripsi error",
  "errors": [{ "field": "email", "message": "Format email tidak valid" }]
}
```
- Success format:
```json
{
  "success": true,
  "message": "Berhasil",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### 6.2 Auth Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | Public | Registrasi user baru |
| POST | `/auth/login` | Public | Login, return JWT |
| POST | `/auth/logout` | 🔒 | Logout, revoke refresh token |
| POST | `/auth/refresh-token` | Public (cookie) | Refresh access token |
| GET | `/auth/verify-email/:token` | Public | Verifikasi email |
| POST | `/auth/forgot-password` | Public | Request reset password |
| POST | `/auth/reset-password` | Public | Reset password dengan token |
| GET | `/auth/me` | 🔒 | Get profil user saat ini |
| GET | `/auth/google` | Public | Redirect ke Google OAuth |
| GET | `/auth/google/callback` | Public | Callback Google OAuth |
| GET | `/auth/sessions` | 🔒 | Daftar sesi aktif |
| DELETE | `/auth/sessions/:id` | 🔒 | Revoke sesi tertentu |
| DELETE | `/auth/sessions` | 🔒 | Revoke semua sesi |

### 6.3 User Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| PUT | `/users/profile` | 🔒 | Update profil |
| PUT | `/users/password` | 🔒 | Ganti password |
| PUT | `/users/avatar` | 🔒 | Upload avatar |
| GET | `/users/addresses` | 🔒 | List alamat |
| POST | `/users/addresses` | 🔒 | Tambah alamat |
| PUT | `/users/addresses/:id` | 🔒 | Edit alamat |
| DELETE | `/users/addresses/:id` | 🔒 | Hapus alamat |
| PUT | `/users/addresses/:id/default` | 🔒 | Set alamat default |
| GET | `/users/notifications` | 🔒 | List notifikasi |
| PUT | `/users/notifications/:id/read` | 🔒 | Tandai dibaca |
| PUT | `/users/notifications/read-all` | 🔒 | Tandai semua dibaca |

### 6.4 Product Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/products` | Public | List produk (dengan filter & pagination) |
| GET | `/products/:slug` | Public | Detail produk |
| GET | `/products/search` | Public | Cari produk |
| POST | `/products` | 🔒 Seller | Buat produk baru |
| PUT | `/products/:id` | 🔒 Seller | Edit produk |
| DELETE | `/products/:id` | 🔒 Seller | Soft delete produk |
| POST | `/products/:id/images` | 🔒 Seller | Upload gambar produk |
| DELETE | `/products/:id/images/:imageId` | 🔒 Seller | Hapus gambar |
| GET | `/products/:id/reviews` | Public | List review produk |
| GET | `/categories` | Public | List semua kategori |
| POST | `/categories` | 🔒 Admin | Buat kategori |
| PUT | `/categories/:id` | 🔒 Admin | Edit kategori |

### 6.5 Cart Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/cart` | 🔒 | Get isi keranjang |
| POST | `/cart` | 🔒 | Tambah item ke keranjang |
| PUT | `/cart/:itemId` | 🔒 | Update kuantitas item |
| DELETE | `/cart/:itemId` | 🔒 | Hapus item dari keranjang |
| DELETE | `/cart` | 🔒 | Kosongkan keranjang |
| POST | `/cart/validate` | 🔒 | Validasi stok sebelum checkout |

### 6.6 Order & Checkout Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/checkout/shipping-cost` | 🔒 | Kalkulasi ongkos kirim |
| POST | `/checkout/voucher/validate` | 🔒 | Validasi voucher |
| POST | `/orders` | 🔒 | Buat order (checkout) |
| GET | `/orders` | 🔒 | List order milik user |
| GET | `/orders/:orderNumber` | 🔒 | Detail order |
| POST | `/orders/:orderNumber/cancel` | 🔒 | Batalkan order |
| POST | `/orders/:orderNumber/confirm-received` | 🔒 | Konfirmasi penerima |
| POST | `/orders/:orderNumber/return` | 🔒 | Request return |

### 6.7 Payment Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/payments/initiate/:orderId` | 🔒 | Inisiasi pembayaran Midtrans |
| GET | `/payments/:orderId/status` | 🔒 | Cek status pembayaran |
| POST | `/payments/webhook/midtrans` | Public (signed) | Webhook Midtrans |

### 6.8 Admin Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/admin/dashboard` | 🔒 Admin | Data KPI dashboard |
| GET | `/admin/users` | 🔒 Admin | List semua user |
| PUT | `/admin/users/:id/status` | 🔒 Admin | Suspend/aktifkan user |
| GET | `/admin/orders` | 🔒 Admin | List semua order |
| PUT | `/admin/orders/:id/status` | 🔒 Admin | Update status order |
| PUT | `/admin/orders/:id/tracking` | 🔒 Admin | Input nomor resi |
| GET | `/admin/products` | 🔒 Admin | List semua produk |
| PUT | `/admin/products/:id/approve` | 🔒 Admin | Approve produk |
| GET | `/admin/reports/sales` | 🔒 Admin | Laporan penjualan |
| POST | `/admin/vouchers` | 🔒 Admin | Buat voucher |
| GET | `/admin/vouchers` | 🔒 Admin | List voucher |

---

## 7. Alur Bisnis (User Flow)

### 7.1 Alur Pembelian (Happy Path)

```
[Beranda] 
  → Cari/Browse Produk 
  → Pilih Produk 
  → Pilih Varian 
  → Tambah ke Keranjang 
  → Lihat Keranjang 
  → Checkout: Pilih Alamat 
  → Checkout: Pilih Kurir 
  → Checkout: Input Voucher (opsional)
  → Checkout: Pilih Metode Bayar 
  → Konfirmasi Order 
  → [Popup Midtrans Snap] 
  → Bayar 
  → Midtrans Webhook → Update Order ke 'paid'
  → Email Konfirmasi dikirim 
  → Seller proses order 
  → Seller input resi → Status 'shipped'
  → Email notifikasi ke buyer 
  → Buyer terima barang → Konfirmasi penerima 
  → Status 'delivered'
  → Buyer bisa beri review
```

### 7.2 Alur Pembayaran Gagal

```
Order dibuat (status: pending_payment) 
  → Midtrans Snap dibuka 
  → User tidak bayar / close 
  → 24 jam: Order expiry job berjalan 
  → Status: 'cancelled' 
  → Stok dikembalikan
```

### 7.3 Alur Return & Refund

```
Order status 'delivered' 
  → Buyer klik "Ajukan Return" (dalam 7 hari) 
  → Isi alasan + upload foto 
  → Admin review request 
  → Approved → Proses refund via Midtrans 
  → Status order: 'refunded'
  → Rejected → Admin tambahkan catatan alasan
```

---

## 8. UI/UX Requirements

### 8.1 Halaman yang Harus Ada

| Halaman | Route | Keterangan |
|---|---|---|
| Beranda | `/` | Hero banner, kategori, produk unggulan, flash sale |
| Login | `/login` | Form login + Google OAuth |
| Register | `/register` | Form registrasi |
| Katalog | `/products` | Grid produk + filter sidebar |
| Detail Produk | `/products/[slug]` | Detail + varian + review |
| Keranjang | `/cart` | Full cart page |
| Checkout | `/checkout` | 3-step checkout |
| Konfirmasi Order | `/checkout/success/[orderNumber]` | Success page |
| Daftar Order | `/orders` | List order user |
| Detail Order | `/orders/[orderNumber]` | Detail order + tracking |
| Profil | `/profile` | Profil + alamat + setting |
| Wishlist | `/wishlist` | Produk wishlist |
| Dashboard Seller | `/dashboard` | Statistik seller |
| Kelola Produk | `/dashboard/products` | CRUD produk |
| Admin Panel | `/admin/*` | Admin dashboard |

### 8.2 Komponen Utama

- **Navbar:** Logo, search bar, cart icon (dengan counter), user avatar menu, notifikasi bell
- **Footer:** Navigasi, social media, info kontak
- **Product Card:** Gambar, nama, harga, rating, badge diskon
- **Cart Sidebar / Cart Page:** List item, kuantitas, subtotal
- **Checkout Stepper:** Indikator progress 3 langkah
- **Order Status Timeline:** Visual progress order dari bayar hingga selesai

### 8.3 Responsivitas
- Mobile First Design
- Breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px)
- Bottom Navigation Bar untuk mobile (Home, Kategori, Keranjang, Profil)

### 8.4 Aksesibilitas
- Semua elemen interaktif dapat diakses via keyboard
- Label ARIA pada komponen custom
- Kontras warna minimal 4.5:1 (WCAG AA)
- Alt text pada semua gambar produk

---

## 9. Keamanan (Security)

### 9.1 Autentikasi & Otorisasi
- JWT menggunakan algoritma RS256 (asymmetric key pair)
- Access token disimpan di memory (bukan localStorage)
- Refresh token di HttpOnly, Secure, SameSite=Strict Cookie
- Validasi token di setiap request protected
- Role-based access control (RBAC) di middleware
- Refresh token rotation: setiap refresh menghasilkan token baru

### 9.2 Validasi Input
- Validasi semua input di backend menggunakan Zod
- Sanitasi HTML pada field rich text (DOMPurify / sanitize-html)
- Validasi ukuran dan tipe file upload
- Parameterized queries via Prisma (prevent SQL Injection)

### 9.3 Rate Limiting
- Login: 5 request/menit per IP
- Register: 3 request/menit per IP
- API umum: 100 request/menit per user
- File upload: 10 request/menit per user

### 9.4 Payment Security
- Verifikasi signature Midtrans webhook:
  ```
  SHA512(order_id + status_code + gross_amount + server_key)
  ```
- Tidak menyimpan data kartu kredit di server
- Semua komunikasi via HTTPS
- Midtrans server-key hanya di backend, tidak pernah di frontend

### 9.5 Data Protection
- Hash password menggunakan bcrypt (cost factor: 12)
- Tidak menyimpan data sensitif plain text
- Environment variables untuk semua credential
- CORS dikonfigurasi hanya untuk domain yang diizinkan
- Helmet.js untuk security headers HTTP

### 9.6 Audit & Logging
- Log semua aktivitas autentikasi (login, logout, gagal login)
- Log semua perubahan status order
- Log semua transaksi pembayaran
- Simpan IP address dan user agent pada log sensitif

---

## 10. Performa & Skalabilitas

### 10.1 Target Performa
- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 2.5 detik
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### 10.2 Optimisasi Frontend
- SSR untuk halaman katalog dan detail produk (SEO + performa)
- ISR (Incremental Static Regeneration) untuk halaman kategori
- Lazy loading gambar (next/image dengan blur placeholder)
- Code splitting otomatis oleh Next.js
- Prefetch route pada hover link

### 10.3 Optimisasi Backend
- Connection pooling PostgreSQL via Prisma (min: 5, max: 20)
- Redis cache untuk:
  - Data kategori (TTL: 1 jam)
  - Produk populer (TTL: 5 menit)
  - Konfigurasi ongkir (TTL: 30 menit)
  - Rate limit counters
- Indeks database pada kolom yang sering di-query
- Pagination wajib pada semua list endpoint

### 10.4 Skalabilitas
- Stateless API (horizontal scaling ready)
- Background jobs via BullMQ + Redis (tidak memblokir request)
- File storage di Cloudinary (bukan server lokal)
- Database connection pooling

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Uptime | 99.9% (max downtime ~8.7 jam/tahun) |
| Response Time | API response < 500ms untuk 95th percentile |
| Concurrent Users | Mendukung 500 concurrent users tanpa degradasi |
| Data Retention | Log disimpan 90 hari, data transaksi minimal 5 tahun |
| Backup | Database backup harian otomatis |
| Disaster Recovery | RTO < 4 jam, RPO < 1 jam |
| Compliance | Sesuai UU ITE dan ketentuan Midtrans |
| Browser Support | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ |

---

## 12. Milestone & Timeline

| Milestone | Fitur | Estimasi |
|---|---|---|
| M1: Foundation | Setup proyek, CI/CD, Docker, DB schema, Auth JWT | 1 minggu |
| M2: Produk | CRUD produk, kategori, upload gambar | 1 minggu |
| M3: Belanja | Keranjang, wishlist, pencarian, filter | 1 minggu |
| M4: Checkout | Alamat, ongkir, voucher, integrasi Midtrans | 1.5 minggu |
| M5: Order | Manajemen order, tracking, notifikasi email | 1 minggu |
| M6: Admin | Admin dashboard, laporan, manajemen user | 1 minggu |
| M7: Polish | Review, return/refund, optimisasi performa | 1 minggu |
| M8: Deploy | Deployment production, monitoring, dokumentasi API | 3 hari |
| **Total** | | **~8 minggu** |

---

## 13. Acceptance Criteria

### Autentikasi
- [x] User dapat register, login, dan logout dengan sukses
- [x] Email verifikasi terkirim dan berfungsi
- [x] JWT token ter-refresh otomatis tanpa intervensi user
- [x] Login Google OAuth berfungsi

### Produk & Katalog
- [x] Seller dapat CRUD produk dengan minimal 1 varian
- [x] Pencarian produk mengembalikan hasil relevan dalam < 500ms
- [x] Filter dan sort berfungsi dengan benar
- [x] Gambar produk terupload ke Cloudinary

### Transaksi
- [x] Pembayaran via VA BCA berhasil diproses
- [x] Webhook Midtrans mengupdate status order secara otomatis
- [x] Stok berkurang setelah order berhasil dibayar
- [x] Stok dikembalikan jika order dibatalkan/expired
- [x] Email konfirmasi terkirim setelah pembayaran berhasil

### Admin
- [x] Dashboard menampilkan KPI yang akurat
- [x] Admin dapat update status order dan input nomor resi
- [x] Laporan penjualan dapat diexport ke CSV

### Keamanan
- [x] Endpoint protected tidak dapat diakses tanpa JWT yang valid
- [x] Rate limiting aktif dan mengembalikan 429 jika melebihi batas
- [x] Password tersimpan dalam bentuk hash, tidak plain text
- [x] Webhook Midtrans memvalidasi signature sebelum diproses
