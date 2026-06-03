import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/redis';
import { sendMail } from '@/lib/mailer';
import { env } from '@/config/env';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
} from '@/utils/crypto.utils';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '@/utils/errors';
import { RegisterSchema, LoginSchema, ResetPasswordSchema } from './auth.schema';
import { AuthResponse, TokenPayload } from './auth.types';
import { z } from 'zod';

type RegisterInput = z.infer<typeof RegisterSchema>;
type LoginInput = z.infer<typeof LoginSchema>;
type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<{ message: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email sudah terdaftar');
    }

    const hashedPasswordString = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPasswordString,
        name: data.name,
        phone: data.phone,
        role: 'buyer', // default role
      },
    });

    // Create verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email
    const verifyUrl = `${env.FRONTEND_URL}/api/v1/auth/verify-email/${token}`;
    await sendMail({
      to: user.email,
      subject: 'Verifikasi Email Anda - Tokoify',
      text: `Halo ${user.name},\n\nSilakan klik tautan berikut untuk memverifikasi akun Anda:\n${verifyUrl}\n\nTautan ini akan kedaluwarsa dalam 1 jam.`,
      html: `<p>Halo <strong>${user.name}</strong>,</p><p>Silakan klik tautan berikut untuk memverifikasi akun Anda:</p><p><a href="${verifyUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Akun</a></p><p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>`,
    });

    return {
      message: 'Registrasi berhasil. Silakan periksa email Anda untuk verifikasi.',
    };
  }

  /**
   * Login user and generate access/refresh tokens
   */
  async login(
    data: LoginInput,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<AuthResponse & { refreshToken: string }> {
    const lockoutKey = `lockout:login:${data.email}`;
    const failedAttempts = await getCache<number>(lockoutKey);

    if (failedAttempts && failedAttempts >= 5) {
      throw new TooManyRequestsError(
        'Akun dikunci sementara karena terlalu banyak kegagalan login. Silakan coba lagi dalam 15 menit.'
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const isPasswordValid = user
      ? await comparePassword(data.password, user.password || '')
      : false;

    if (!user || !isPasswordValid) {
      // Increment rate-limiting attempts
      const attempts = failedAttempts ? failedAttempts + 1 : 1;
      await setCache(lockoutKey, attempts, 900); // 15 mins lock

      if (attempts >= 5) {
        throw new TooManyRequestsError(
          'Akun dikunci sementara karena terlalu banyak kegagalan login. Silakan coba lagi dalam 15 menit.'
        );
      }

      throw new UnauthorizedError('Email atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Akun Anda dinonaktifkan. Silakan hubungi admin.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Silakan verifikasi email Anda terlebih dahulu sebelum login.');
    }

    // Reset lockout counter on success
    await deleteCache(lockoutKey);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        ipAddress,
        deviceInfo,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify email via token
   */
  async verifyEmail(token: string): Promise<void> {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new NotFoundError('Token verifikasi');
    }

    if (verification.usedAt) {
      throw new BadRequestError('Token verifikasi sudah digunakan');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestError('Token verifikasi telah kedaluwarsa');
    }

    // Update user & token status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Invalidate user cache
    await deleteCache(`user:profile:${verification.userId}`);
  }

  /**
   * Perform token rotation
   */
  async refreshToken(
    oldToken: string,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await prisma.session.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Sesi tidak valid');
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Sesi telah kedaluwarsa. Silakan login kembali.');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Rotate sessions
    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: session.user.id,
          token: refreshToken,
          ipAddress,
          deviceInfo,
          expiresAt,
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Revoke a refresh token (logout)
   */
  async logout(token: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
  }

  /**
   * Request password reset link
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent user enumeration, we don't throw an error if user isn't found
    if (user && user.isActive) {
      const resetToken = crypto.randomUUID();
      const redisKey = `password_reset:${resetToken}`;

      // Save to redis with 1 hour TTL
      await setCache(redisKey, user.id, 3600);

      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendMail({
        to: user.email,
        subject: 'Reset Password Anda - Tokoify',
        text: `Halo ${user.name},\n\nAnda menerima email ini karena Anda meminta reset password untuk akun Anda.\nSilakan klik tautan berikut untuk mengubah password Anda:\n${resetUrl}\n\nTautan ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta ini, silakan abaikan email ini.`,
        html: `<p>Halo <strong>${user.name}</strong>,</p><p>Anda menerima email ini karena meminta reset password untuk akun Anda.</p><p>Silakan klik tautan berikut untuk mengubah password Anda:</p><p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p><p>Tautan ini akan kedaluwarsa dalam 1 jam.</p><p>Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.</p>`,
      });
    }

    return {
      message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    const redisKey = `password_reset:${data.token}`;
    const userId = await getCache<string>(redisKey);

    if (!userId) {
      throw new BadRequestError('Token reset password tidak valid atau telah kedaluwarsa');
    }

    const hashedPasswordString = await hashPassword(data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPasswordString },
      }),
      // Revoke all sessions (forces logout on all devices)
      prisma.session.deleteMany({
        where: { userId },
      }),
    ]);

    // Invalidate caches
    await deleteCache(redisKey);
    await deleteCache(`user:profile:${userId}`);

    return {
      message: 'Password berhasil diubah. Silakan login kembali dengan password baru Anda.',
    };
  }
}

export const authService = new AuthService();
export default authService;
