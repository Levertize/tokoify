'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import apiClient from '@/lib/api';

const resetPasswordSchema = z
  .object({
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

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
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

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error('Token tidak valid atau tidak ditemukan di URL');
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success(response.message || 'Password berhasil diubah!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mengubah password. Token mungkin kedaluwarsa.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans text-slate-100">
      <Toaster position="top-center" richColors />
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Tokoify
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-100">Ubah Password Baru</h2>
          <p className="mt-1 text-sm text-slate-400 mb-6">
            Masukkan password baru Anda di bawah ini
          </p>

          {!token ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
              Token reset tidak ditemukan di URL. Silakan minta link reset password baru.
              <div className="mt-4">
                <Link
                  href="/forgot-password"
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-slate-950 transition duration-150 hover:bg-red-400"
                >
                  Minta Link Baru
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password Baru
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
                  placeholder="Ulangi password baru"
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
                  'Simpan Password'
                )}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-sans text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
