import { z } from 'zod';

export const AddToCartSchema = z.object({
  variantId: z.string({
    required_error: 'variantId wajib diisi',
  }),
  quantity: z.number({
    required_error: 'quantity wajib diisi',
  })
  .int('quantity harus berupa bilangan bulat')
  .min(1, 'quantity minimal 1'),
});

export const UpdateQuantitySchema = z.object({
  quantity: z.number({
    required_error: 'quantity wajib diisi',
  })
  .int('quantity harus berupa bilangan bulat')
  .min(1, 'quantity minimal 1'),
});
