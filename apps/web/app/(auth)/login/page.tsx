'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import useAuthStore from '@/store/authStore';
import apiClient from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email Anda berhasil diverifikasi. Silakan login.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', data);
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      toast.success('Login berhasil! Selamat datang kembali.');
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal login. Silakan coba lagi.';
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
          <p className="mt-2 text-sm text-slate-400">
            Platform belanja modern dan tepercaya
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-100">Selamat Datang Kembali</h2>
          <p className="mt-1 text-sm text-slate-400 mb-6">
            Masuk untuk mengakses akun Anda
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="nama@email.com"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150"
                >
                  Lupa Password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                'Masuk ke Akun'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="h-px w-full bg-slate-800" />
            <span className="px-3 text-xs text-slate-500 uppercase tracking-wider">Atau</span>
            <span className="h-px w-full bg-slate-800" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-sans text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
