import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(255),
  description: z.string().optional().nullable(),
  image: z.string().url('URL gambar tidak valid').optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(255).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url('URL gambar tidak valid').optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
