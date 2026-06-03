# 📐 RULES — Panduan Pengembangan E-Commerce Full-Stack
**Version:** 1.0.0  
**Last Updated:** 2026-06-01  
**Untuk:** AI Coding Agent / Developer  

> ⚠️ **WAJIB DIBACA SEBELUM MENULIS KODE APAPUN.**  
> File ini adalah sumber kebenaran tunggal (single source of truth) untuk semua keputusan teknis.  
> Jika ada konflik antara file ini dengan instruksi lain, file ini yang berlaku.

---

## 📋 Daftar Isi
1. [Tech Stack & Versi](#1-tech-stack--versi)
2. [Struktur Folder](#2-struktur-folder)
3. [Konvensi Penamaan](#3-konvensi-penamaan)
4. [TypeScript Rules](#4-typescript-rules)
5. [Backend Rules (API)](#5-backend-rules-api)
6. [Frontend Rules (Next.js)](#6-frontend-rules-nextjs)
7. [Database Rules (Prisma)](#7-database-rules-prisma)
8. [Security Rules](#8-security-rules)
9. [API Design Rules](#9-api-design-rules)
10. [Error Handling](#10-error-handling)
11. [Testing Rules](#11-testing-rules)
12. [Environment Variables](#12-environment-variables)
13. [Git & Commit Rules](#13-git--commit-rules)
14. [Deployment Rules](#14-deployment-rules)
15. [Hal yang DILARANG](#15-hal-yang-dilarang)

---

## 1. Tech Stack & Versi

### Versi yang HARUS digunakan (jangan upgrade tanpa diskusi):
```
Node.js         : 20.x LTS
TypeScript      : 5.x
Next.js         : 14.x (App Router) — BUKAN Pages Router
React           : 18.x
Express         : 4.x (atau Fastify 4.x)
Prisma          : 5.x
PostgreSQL      : 16.x
Redis           : 7.x
Tailwind CSS    : 3.x
shadcn/ui       : latest
Zod             : 3.x
React Hook Form : 7.x
TanStack Query  : 5.x (React Query)
Zustand         : 4.x
BullMQ          : 5.x
Multer          : 1.x
bcrypt          : 5.x
jsonwebtoken    : 9.x
Midtrans SDK    : midtrans-client (latest)
```

### Package Manager:
- **GUNAKAN `pnpm`** sebagai package manager utama
- Jangan menggunakan npm atau yarn tanpa alasan yang jelas
- Lockfile: `pnpm-lock.yaml` harus selalu di-commit

---

## 2. Struktur Folder

### 2.1 Monorepo Structure
```
ecommerce-app/
├── apps/
│   ├── web/          # Next.js 14 Frontend
│   └── api/          # Express/Fastify Backend
├── packages/
│   └── shared-types/ # Shared TypeScript types
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo config
```

### 2.2 Backend (apps/api/src/)
```
src/
├── modules/                    # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts      # Zod schemas
│   │   └── auth.types.ts
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.routes.ts
│   │   ├── product.schema.ts
│   │   └── product.types.ts
│   └── [modul lainnya sesuai PRD]
├── middlewares/
│   ├── auth.middleware.ts       # JWT validation
│   ├── role.middleware.ts       # RBAC check
│   ├── rateLimiter.middleware.ts
│   ├── upload.middleware.ts     # Multer config
│   └── errorHandler.middleware.ts
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── redis.ts                # Redis client singleton
│   ├── bullmq.ts               # Queue setup
│   ├── cloudinary.ts           # Cloudinary config
│   ├── midtrans.ts             # Midtrans client
│   └── mailer.ts               # Nodemailer setup
├── jobs/
│   ├── email.job.ts
│   ├── orderExpiry.job.ts
│   └── notification.job.ts
├── utils/
│   ├── response.utils.ts       # Standardized response helpers
│   ├── crypto.utils.ts         # Password hash, token gen
│   ├── pagination.utils.ts
│   └── logger.ts               # Winston logger
├── config/
│   ├── env.ts                  # Zod env validation
│   └── constants.ts
├── types/
│   └── express.d.ts            # Express request type augmentation
└── app.ts                      # Express app setup
```

### 2.3 Frontend (apps/web/)
```
app/
├── (auth)/                     # Route group: no navbar
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (shop)/                     # Route group: with navbar
│   ├── layout.tsx
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Catalog
│   │   └── [slug]/page.tsx     # Product detail
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── success/[orderNumber]/page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [orderNumber]/page.tsx
│   ├── profile/page.tsx
│   └── wishlist/page.tsx
├── (seller)/
│   ├── layout.tsx
│   └── dashboard/
│       ├── page.tsx
│       └── products/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [id]/edit/page.tsx
├── (admin)/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── users/page.tsx
│       ├── orders/page.tsx
│       └── products/page.tsx
├── api/                        # Next.js Route Handlers (minimal, mostly proxy)
└── layout.tsx                  # Root layout

components/
├── ui/                         # shadcn/ui components (DO NOT MODIFY)
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── BottomNav.tsx
├── product/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilter.tsx
│   └── ProductImageGallery.tsx
├── cart/
│   ├── CartItem.tsx
│   └── CartSummary.tsx
├── checkout/
│   ├── CheckoutStepper.tsx
│   ├── AddressStep.tsx
│   ├── ShippingStep.tsx
│   └── PaymentStep.tsx
├── order/
│   ├── OrderCard.tsx
│   └── OrderTimeline.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    └── ErrorBoundary.tsx

hooks/
├── useAuth.ts
├── useCart.ts
├── useProducts.ts
└── useOrders.ts

lib/
├── api.ts                      # Axios instance dengan interceptor
├── auth.ts                     # Auth helper functions
└── utils.ts                    # cn() dan utilitas umum

store/
├── authStore.ts                # Zustand auth state
├── cartStore.ts                # Cart UI state
└── uiStore.ts                  # Global UI state (modal, toast)

types/
└── index.ts                    # Re-export dari shared-types
```

---

## 3. Konvensi Penamaan

### 3.1 File & Folder
```
Folder              : kebab-case          → product-images/
Komponen React      : PascalCase.tsx      → ProductCard.tsx
Hook                : camelCase.ts        → useCart.ts
Service/Util        : camelCase.ts        → auth.service.ts
Route handler       : camelCase.routes.ts → product.routes.ts
Schema Zod          : camelCase.schema.ts → auth.schema.ts
Type file           : camelCase.types.ts  → product.types.ts
Prisma migration    : timestamp_kebab     → 20260601_add_reviews
```

### 3.2 TypeScript/JavaScript
```typescript
// Variables & functions: camelCase
const productList = [];
function getProductById() {}

// Konstanta global: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE_MB = 2;
const JWT_EXPIRY = '15m';

// Interfaces & Types: PascalCase, prefix 'I' untuk interface (opsional, pilih satu gaya lalu konsisten)
interface CreateProductDto { ... }
type OrderStatus = 'pending_payment' | 'paid' | ...

// Enums: PascalCase dengan value SCREAMING_SNAKE_CASE
enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

// React Components: PascalCase
function ProductCard({ product }: ProductCardProps) { ... }

// Custom Hooks: camelCase dengan prefix 'use'
function useCartItems() { ... }
```

### 3.3 Database (Prisma)
```
Tabel/Model         : PascalCase singular  → User, Product, OrderItem
Kolom               : snake_case           → created_at, is_active
Foreign key         : [table]_id           → user_id, product_id
Enum nama           : PascalCase           → UserRole, OrderStatus
Enum value          : snake_case lowercase → pending_payment, super_admin
```

### 3.4 API Routes
```
Resource (plural)   : /api/v1/products
Resource dengan ID  : /api/v1/products/:id
Nested resource     : /api/v1/products/:id/reviews
Action (verb)       : /api/v1/orders/:id/cancel
```

---

## 4. TypeScript Rules

### 4.1 Aturan Wajib
```typescript
// ✅ WAJIB: Selalu definisikan return type fungsi async
async function getUserById(id: string): Promise<User | null> { ... }

// ✅ WAJIB: Gunakan type/interface, jangan 'any'
// JANGAN:
function processData(data: any) { ... }
// LAKUKAN:
function processData(data: CreateOrderDto) { ... }

// ✅ WAJIB: Gunakan Zod untuk validasi runtime
const CreateProductSchema = z.object({
  name: z.string().min(3).max(500),
  price: z.number().positive(),
});
type CreateProductDto = z.infer<typeof CreateProductSchema>;

// ✅ WAJIB: Non-null assertion hanya jika BENAR-BENAR yakin
const element = document.getElementById('root')!; // Boleh jika yakin
// Tapi selalu prefer null check:
const element = document.getElementById('root');
if (!element) throw new Error('Root element not found');

// ✅ WAJIB: Strict mode enabled di tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 4.2 tsconfig.json (Backend)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4.3 tsconfig.json (Frontend)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 5. Backend Rules (API)

### 5.1 Controller Rules
```typescript
// Controller HANYA boleh:
// 1. Menerima request
// 2. Memanggil service
// 3. Mengembalikan response

// Controller TIDAK boleh:
// - Mengandung business logic
// - Query langsung ke database
// - Memanggil external API langsung

// ✅ Contoh yang benar:
export const createProduct = async (req: Request, res: Response) => {
  const validatedData = CreateProductSchema.parse(req.body);
  const product = await productService.create(req.user!.id, validatedData);
  return successResponse(res, product, 'Produk berhasil dibuat', 201);
};
```

### 5.2 Service Rules
```typescript
// Service mengandung semua business logic
// Service memanggil Prisma / Redis / External API

// ✅ Contoh service yang benar:
class ProductService {
  async create(sellerId: string, data: CreateProductDto): Promise<Product> {
    // Business logic di sini
    const slug = generateSlug(data.name);
    
    // Cek duplikasi slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new ConflictError('Nama produk sudah digunakan');
    
    return prisma.product.create({
      data: { ...data, slug, sellerId },
    });
  }
}
```

### 5.3 Middleware Rules
```typescript
// Auth middleware WAJIB ada di semua protected route
// Urutan middleware: rateLimiter → authenticate → authorize → validate → controller

// ✅ Cara penggunaan di routes:
router.post(
  '/products',
  rateLimiter('default'),
  authenticate,           // Verify JWT
  authorize('seller', 'admin'), // Role check
  validate(CreateProductSchema), // Body validation
  productController.create
);
```

### 5.4 Prisma Rules
```typescript
// ✅ SELALU gunakan singleton Prisma client
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ✅ Gunakan transactions untuk operasi multi-tabel
await prisma.$transaction(async (tx) => {
  await tx.order.create({ ... });
  await tx.cartItem.deleteMany({ ... });
  await tx.productVariant.update({ ... }); // Kurangi stok
});

// ✅ Selalu include relasi yang diperlukan, hindari N+1
const products = await prisma.product.findMany({
  include: {
    images: { where: { isPrimary: true }, take: 1 },
    variants: true,
    category: true,
  },
});
```

### 5.5 Response Format
```typescript
// utils/response.utils.ts
export const successResponse = (
  res: Response,
  data: unknown,
  message = 'Berhasil',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (
  res: Response,
  data: unknown[],
  meta: PaginationMeta,
  message = 'Berhasil'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: ValidationError[]
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
```

### 5.6 Background Jobs Rules
```typescript
// Semua operasi yang tidak perlu real-time HARUS dijalankan sebagai job:
// - Kirim email
// - Update statistik produk (avg rating, sold count)
// - Hapus gambar di Cloudinary
// - Order expiry check

// ✅ Cara menambahkan job:
await emailQueue.add('send-order-confirmation', {
  orderId: order.id,
  userEmail: user.email,
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});
```

---

## 6. Frontend Rules (Next.js)

### 6.1 Server vs Client Components
```typescript
// DEFAULT: Server Component (tidak perlu 'use client')
// Gunakan untuk: fetch data, halaman statis, SEO content

// 'use client' HANYA jika:
// - Menggunakan useState, useEffect, useReducer
// - Event handlers (onClick, onChange, dll.)
// - Browser APIs (window, document, localStorage)
// - Third-party library yang butuh browser

// ✅ Pattern yang benar: Server Component fetch data, lalu pass ke Client Component
// app/products/[slug]/page.tsx (Server Component)
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug); // Fetch di server
  return <ProductDetailClient product={product} />; // Pass ke client component
}

// components/product/ProductDetailClient.tsx
'use client';
export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  // ... interaktivitas di sini
}
```

### 6.2 Data Fetching Rules
```typescript
// Server Components: fetch langsung
async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: { revalidate: 60 }, // ISR: revalidate setiap 60 detik
  });
  return res.json();
}

// Client Components: gunakan TanStack Query
function useProducts(filters: ProductFilter) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.get('/products', { params: filters }),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

// Mutations: gunakan useMutation
function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddToCartDto) => apiClient.post('/cart', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Produk ditambahkan ke keranjang');
    },
  });
}
```

### 6.3 Form Rules
```typescript
// WAJIB gunakan React Hook Form + Zod
const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

function LoginForm() {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    // Handle submit
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### 6.4 State Management Rules
```typescript
// Zustand: hanya untuk UI state yang benar-benar global
// (auth user, cart item count untuk badge, modal state)

// TanStack Query: untuk server state (data dari API)

// useState: untuk local component state

// ✅ Zustand Store example:
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null }),
}));

// JANGAN simpan accessToken di localStorage!
// Simpan di memory (Zustand store) — reset saat refresh, lalu re-fetch via refresh token cookie
```

### 6.5 API Client Rules
```typescript
// lib/api.ts — Axios instance dengan interceptor
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Kirim cookie di setiap request
});

// Request interceptor: tambahkan access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → refresh token
let isRefreshing = false;
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axios.post('/auth/refresh-token', {}, { withCredentials: true });
        useAuthStore.getState().setAccessToken(data.accessToken);
        return apiClient(error.config); // Retry original request
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

### 6.6 Styling Rules
```typescript
// ✅ Gunakan Tailwind CSS utility classes
// ✅ Gunakan shadcn/ui components untuk UI primitif
// ✅ Gunakan cn() helper untuk conditional classes

import { cn } from '@/lib/utils';

// cn() adalah merge dari clsx + tailwind-merge
<Button className={cn(
  'base-classes',
  isLoading && 'opacity-50 cursor-not-allowed',
  variant === 'danger' && 'bg-red-500 hover:bg-red-600'
)} />

// JANGAN gunakan inline styles kecuali untuk nilai dinamis yang tidak bisa di-Tailwind
// JANGAN buat CSS file baru kecuali benar-benar perlu
// JANGAN gunakan !important

// Warna menggunakan CSS variables (dari shadcn):
// bg-background, text-foreground, border-border, dll.
```

---

## 7. Database Rules (Prisma)

### 7.1 Schema Rules
```prisma
// ✅ Setiap model HARUS punya:
// - id (UUID, bukan auto-increment)
// - created_at
// - updated_at (kecuali model yang tidak pernah diupdate)

model Product {
  id         String   @id @default(cuid())  // atau @default(uuid())
  // ... fields
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  
  @@map("products") // Nama tabel snake_case plural
}

// ✅ WAJIB gunakan @map untuk snake_case kolom
// ✅ WAJIB gunakan @@map untuk snake_case nama tabel
// ✅ Gunakan soft delete untuk data penting (products, users)
// ✅ Tambahkan @@index pada kolom yang sering di-query
```

### 7.2 Migration Rules
```bash
# Buat migration baru:
pnpm prisma migrate dev --name nama_deskriptif

# Contoh nama migration yang baik:
# add_product_variants
# add_payment_gateway_fields
# create_notifications_table

# JANGAN: update, change, fix (terlalu generik)
# JANGAN edit migration file yang sudah di-commit

# Sebelum push ke production:
pnpm prisma migrate deploy
```

### 7.3 Seed Rules
```typescript
// prisma/seed.ts
// Seed HARUS mencakup:
// - 1 akun super_admin (email: admin@ecommerce.local, password: Admin123!)
// - 1 akun seller (email: seller@ecommerce.local, password: Seller123!)
// - 1 akun buyer (email: buyer@ecommerce.local, password: Buyer123!)
// - Minimal 5 kategori
// - Minimal 20 produk dengan varian
// - 1 voucher aktif (kode: TESTDISKON10)
```

---

## 8. Security Rules

### 8.1 Autentikasi
```typescript
// ✅ Access Token: RS256, expire 15 menit, simpan di memory
// ✅ Refresh Token: expire 7 hari, simpan di HttpOnly cookie
// ✅ Cookie settings:
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  path: '/api/v1/auth',
});

// ✅ Password hashing:
const BCRYPT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

// ✅ Validasi signature Midtrans webhook:
const signatureKey = SHA512(
  `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`
);
if (signatureKey !== req.body.signature_key) {
  throw new UnauthorizedError('Invalid webhook signature');
}
```

### 8.2 Input Validation
```typescript
// ✅ Semua input dari user WAJIB divalidasi dengan Zod
// ✅ Sanitasi HTML pada field deskripsi produk

import sanitizeHtml from 'sanitize-html';

const cleanDescription = sanitizeHtml(rawDescription, {
  allowedTags: ['b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'p', 'br'],
  allowedAttributes: {},
});

// ✅ File upload validation:
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ✅ JANGAN pernah gunakan req.body langsung tanpa validasi
```

### 8.3 Credential Rules
```typescript
// ✅ SEMUA credential di .env, TIDAK PERNAH di-hardcode
// ✅ Validasi env vars saat startup:

// config/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  MIDTRANS_SERVER_KEY: z.string().startsWith('SB-').or(z.string().startsWith('Mid-')),
  REDIS_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

export const env = envSchema.parse(process.env);
// Jika ada env yang missing, app TIDAK BOLEH start

// ❌ DILARANG:
const SECRET = 'my-secret-key'; // Hardcoded!
```

### 8.4 HTTP Security Headers
```typescript
// Wajib pasang Helmet.js di Express:
import helmet from 'helmet';
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://app.midtrans.com"],
    imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
  },
}));
```

---

## 9. API Design Rules

### 9.1 HTTP Methods
```
GET    → Read only, tidak boleh mengubah state
POST   → Create resource atau action (checkout, cancel)
PUT    → Full update (replace)
PATCH  → Partial update
DELETE → Delete resource
```

### 9.2 Status Codes
```
200 OK           → GET berhasil, PUT/PATCH berhasil
201 Created      → POST berhasil membuat resource
204 No Content   → DELETE berhasil
400 Bad Request  → Validasi input gagal
401 Unauthorized → Tidak ada/token invalid
403 Forbidden    → Tidak punya izin (role salah)
404 Not Found    → Resource tidak ditemukan
409 Conflict     → Duplikasi (email sudah ada, dll.)
422 Unprocessable→ Business logic error (stok habis, dll.)
429 Too Many Req → Rate limit exceeded
500 Server Error → Unexpected server error
```

### 9.3 Pagination
```typescript
// Semua list endpoint WAJIB paginasi
// Query params: ?page=1&limit=20

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Default: page=1, limit=20, max limit=100
// Jangan izinkan limit > 100
```

### 9.4 Filtering & Sorting
```typescript
// Filter: ?category=elektronik&minPrice=100000&maxPrice=500000
// Sort: ?sortBy=price&sortOrder=asc (atau desc)
// Search: ?q=sepatu+nike

// Validasi query params dengan Zod sebelum digunakan
const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  q: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'price', 'rating', 'soldCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

---

## 10. Error Handling

### 10.1 Custom Error Classes
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: ValidationError[]
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: ValidationError[]) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403); }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(`${resource} tidak ditemukan`, 404); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409); }
}

export class BusinessError extends AppError {
  constructor(message: string) { super(message, 422); }
}
```

### 10.2 Global Error Handler
```typescript
// middlewares/errorHandler.middleware.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error (tapi jangan log ke console di production)
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Data sudah ada' });
    }
  }

  // Unknown error — jangan expose detail ke client
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
  });
};
```

### 10.3 Frontend Error Handling
```typescript
// Semua API call HARUS di-wrap try-catch atau handle error di useMutation
// Gunakan toast untuk error yang perlu ditampilkan ke user

const { mutate } = useMutation({
  mutationFn: addToCart,
  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message ?? 'Terjadi kesalahan';
    toast.error(message);
  },
});

// Tambahkan ErrorBoundary di layout utama
// Halaman error custom: app/error.tsx, app/not-found.tsx
```

---

## 11. Testing Rules

### 11.1 Testing Stack
```
Backend unit test  : Vitest
Backend integration: Supertest + Vitest
Frontend unit test : Vitest + Testing Library
E2E (opsional)     : Playwright
```

### 11.2 Coverage Target
```
Unit tests         : Service layer — target 80% coverage
Integration tests  : Semua endpoint API — minimal happy path + error case
Wajib ditest       :
  - Auth flow (register, login, refresh, logout)
  - Checkout flow (cart → order → payment webhook)
  - Payment webhook processing
  - Midtrans signature verification
```

### 11.3 Test File Convention
```
apps/api/src/modules/auth/
├── auth.service.ts
└── auth.service.test.ts    # Unit test untuk service

apps/api/src/modules/auth/
└── auth.integration.test.ts # Integration test endpoint
```

---

## 12. Environment Variables

### 12.1 File .env.example (WAJIB ADA di repo)
```env
# ================================
# APPLICATION
# ================================
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# ================================
# DATABASE
# ================================
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# ================================
# REDIS
# ================================
REDIS_URL=redis://localhost:6379

# ================================
# JWT (Generate dengan: openssl genrsa -out private.pem 2048)
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
EMAIL_FROM="E-Commerce <noreply@ecommerce.local>"

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

### 12.2 Environment Rules
- `.env` TIDAK BOLEH di-commit ke git (ada di `.gitignore`)
- `.env.example` WAJIB di-commit dan selalu diupdate
- Variabel dengan prefix `NEXT_PUBLIC_` aman di-expose ke browser
- Variabel tanpa prefix TIDAK PERNAH dikirim ke frontend
- Validasi semua env vars saat startup (lihat Security Rules)

---

## 13. Git & Commit Rules

### 13.1 Branch Strategy (Git Flow)
```
main          → Production, protected, merge via PR
develop       → Development, integrasi semua fitur
feature/*     → Fitur baru (misal: feature/payment-gateway)
fix/*         → Bug fix (misal: fix/cart-quantity-validation)
hotfix/*      → Critical fix untuk production
release/*     → Release candidate
```

### 13.2 Commit Message Format (Conventional Commits)
```
<type>(<scope>): <description>

Types:
feat     → Fitur baru
fix      → Bug fix
refactor → Refactor tanpa mengubah behavior
style    → Formatting, missing semicolons (tanpa logic change)
test     → Tambah/update test
docs     → Dokumentasi
chore    → Build process, dependency updates
perf     → Performance improvement
security → Security fix

Contoh:
feat(auth): add Google OAuth 2.0 login
fix(cart): fix quantity not updating when same variant added twice
feat(payment): integrate Midtrans Snap payment
refactor(product): extract image upload to separate service
docs(api): add Swagger documentation for order endpoints
```

### 13.3 PR Rules
- Setiap PR WAJIB ada deskripsi yang menjelaskan apa yang diubah
- PR harus lulus semua CI checks (lint, test, build)
- Minimal 1 review sebelum merge ke develop
- Squash merge ke main

---

## 14. Deployment Rules

### 14.1 Docker
```dockerfile
# Gunakan multi-stage build untuk production image yang kecil
# Backend Dockerfile:
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

### 14.2 Docker Compose (Development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 14.3 CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
# Pipeline steps:
# 1. Lint (ESLint + TypeScript check)
# 2. Unit Tests
# 3. Integration Tests
# 4. Build Docker image
# 5. Push ke registry (hanya main branch)
# 6. Deploy ke production (hanya main branch, manual trigger)
```

### 14.4 Health Check
```typescript
// WAJIB ada endpoint health check:
// GET /health → { status: 'ok', db: 'connected', redis: 'connected', timestamp }
// GET /api/v1/health → Same untuk API versioning
```

---

## 15. Hal yang DILARANG

### ❌ SECURITY — JANGAN PERNAH:
- Simpan access token di `localStorage` atau `sessionStorage`
- Simpan credential/API key di source code
- Return stack trace / error detail ke client di production
- Skip validasi Midtrans webhook signature
- Gunakan `eval()` atau `Function()` constructor
- Disable SSL/TLS verification (`rejectUnauthorized: false` di production)
- Log data sensitif (password, token, nomor kartu)
- Izinkan SQL mentah tanpa parameterisasi

### ❌ CODE QUALITY — JANGAN:
- Gunakan `any` di TypeScript (gunakan `unknown` jika terpaksa)
- Commit file `.env` yang berisi credential
- Push langsung ke branch `main` (selalu via PR)
- Tulis business logic di controller
- Query database langsung dari controller
- Buat API endpoint tanpa validasi input
- Gunakan `console.log` di production (gunakan logger)
- Hard-code URL, ID, atau konfigurasi (gunakan env vars atau constants)
- Buat komponen React yang melakukan fetch data DAN handle logic sekaligus

### ❌ DATABASE — JANGAN:
- Jalankan raw SQL tanpa parameter binding
- Edit migration file yang sudah di-commit
- Hapus data penting secara hard-delete (gunakan soft delete)
- Buat query tanpa limit/pagination pada data besar
- Simpan file/gambar di database (gunakan Cloudinary)

### ❌ FRONTEND — JANGAN:
- Simpan state server di Zustand (gunakan TanStack Query)
- Fetch data di `useEffect` jika bisa di Server Component
- Gunakan `dangerouslySetInnerHTML` tanpa sanitasi
- Kirim credential ke frontend yang tidak perlu
- Buat CSS module baru jika bisa dengan Tailwind

### ❌ API — JANGAN:
- Return data lebih dari yang dibutuhkan (over-fetching)
- Buat endpoint tanpa authentication jika data sensitif
- Gunakan GET request untuk operasi yang mengubah data
- Return 200 untuk operasi yang gagal
- Izinkan pagination tanpa batas (selalu ada max limit)

---

## ✅ Checklist Sebelum Submit PR

```
□ Semua TypeScript errors terselesaikan (npx tsc --noEmit)
□ ESLint tidak ada error (npx eslint .)
□ Tests lulus (pnpm test)
□ Tidak ada console.log yang tertinggal
□ .env.example diupdate jika ada env var baru
□ Prisma migration dibuat jika ada perubahan schema
□ Dokumentasi API diupdate jika ada endpoint baru/berubah
□ Mobile responsiveness dicek untuk perubahan UI
□ Error handling sudah ditambahkan
□ Loading state sudah ditambahkan untuk operasi async
□ Tidak ada credential yang ter-hardcode
```
