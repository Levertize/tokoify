import { z } from 'zod';

export const CreateVariantSchema = z.object({
  sku: z.string().min(3, 'SKU minimal 3 karakter'),
  options: z.record(z.string(), z.string(), {
    required_error: 'Pilihan varian wajib diisi',
  }),
  price: z.coerce.number().positive('Harga varian harus bernilai positif'),
  stock: z.coerce.number().int().nonnegative('Stok tidak boleh bernilai negatif'),
});

export const CreateProductSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter').max(500),
  categoryId: z.string().min(1, 'ID kategori wajib diisi'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  basePrice: z.coerce.number().positive('Harga dasar harus bernilai positif'),
  weight: z.coerce.number().positive('Berat harus bernilai positif'),
  tags: z.array(z.string()).max(10, 'Tag maksimal 10').optional(),
  variants: z.array(CreateVariantSchema).min(1, 'Produk minimal memiliki 1 varian'),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter').max(500).optional(),
  categoryId: z.string().optional(),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').optional(),
  basePrice: z.coerce.number().positive('Harga dasar harus bernilai positif').optional(),
  weight: z.coerce.number().positive('Berat harus bernilai positif').optional(),
  tags: z.array(z.string()).max(10, 'Tag maksimal 10').optional(),
  isActive: z.boolean().optional(),
});

export const UpdateVariantSchema = z.object({
  price: z.coerce.number().positive('Harga harus bernilai positif').optional(),
  stock: z.coerce.number().int().nonnegative('Stok tidak boleh bernilai negatif').optional(),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'rating', 'soldCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  sellerId: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});
