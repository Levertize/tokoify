'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import apiClient from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/auth/forgot-password', data);
      toast.success(response.message || 'Email permintaan reset berhasil dikirim!');
      setTargetEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Permintaan Terkirim</h2>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Jika email <strong className="text-slate-200">{targetEmail}</strong> terdaftar di sistem kami, Anda akan menerima link untuk menyetel ulang password.
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Silakan periksa folder inbox atau spam email Anda.
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

      <div className="z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Tokoify
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-100">Lupa Password?</h2>
          <p className="mt-1 text-sm text-slate-400 mb-6">
            Masukkan email Anda untuk menerima link reset password
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                'Kirim Link Reset'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150"
            >
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
