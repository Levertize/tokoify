'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import apiClient from '@/lib/api';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
    email: z.string().email('Format email tidak valid'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\:;"'<>,.?/~`]).*$/,
        'Password harus mengandung huruf besar, angka, dan karakter spesial'
      ),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const getPasswordStrength = (pwd: string): { score: number; label: string; colorClass: string } => {
    if (!pwd) return { score: 0, label: '', colorClass: 'bg-transparent' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&#^()_+=\[\]{}|\\:;"'<>,.?/~`]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Sangat Lemah', colorClass: 'bg-red-500 w-1/4' };
      case 2:
        return { score: 2, label: 'Lemah', colorClass: 'bg-orange-500 w-2/4' };
      case 3:
        return { score: 3, label: 'Sedang', colorClass: 'bg-yellow-500 w-3/4' };
      case 4:
        return { score: 4, label: 'Kuat', colorClass: 'bg-emerald-500 w-full' };
      default:
        return { score: 0, label: '', colorClass: 'bg-transparent' };
    }
  };

  const strength = getPasswordStrength(passwordInput);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      toast.success(response.message || 'Registrasi sukses!');
      setRegisteredEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans text-slate-100">
        <div className="absolute top-0 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />

        <div className="z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Registrasi Berhasil</h2>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Link verifikasi akun telah dikirim ke email <strong className="text-slate-200">{registeredEmail}</strong>.
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Silakan periksa folder inbox atau spam Anda untuk mengaktifkan akun Anda sebelum masuk.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-bold text-slate-950 transition duration-200 hover:brightness-110"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans text-slate-100">
      <Toaster position="top-center" richColors />
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md my-8">
        {/* Logo/Brand */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Tokoify
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Bergabung dengan jutaan pembeli lainnya
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-100">Buat Akun Baru</h2>
          <p className="mt-1 text-sm text-slate-400 mb-6">
            Daftar gratis untuk mulai berbelanja
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Nama Anda"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="nama@email.com"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nomor Telepon (Opsional)
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="0812XXXXXXXX"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 border-slate-800`}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="Minimal 8 karakter"
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-400">{errors.password.message}</p>
              )}

              {/* Real-time strength indicator bar */}
              {passwordInput && (
                <div className="mt-2.5">
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.colorClass}`} />
                  </div>
                  <span className="mt-1 block text-[10px] text-right font-medium text-slate-400">
                    Kekuatan: {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Ulangi password"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                'Buat Akun'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center justify-between">
            <span className="h-px w-full bg-slate-800" />
            <span className="px-3 text-xs text-slate-500 uppercase tracking-wider">Atau</span>
            <span className="h-px w-full bg-slate-800" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
