import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\:;"'<>,.?/~`]).*$/;

export const RegisterSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      passwordRegex,
      'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter spesial'
    ),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token wajib disediakan'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        passwordRegex,
        'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter spesial'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });
