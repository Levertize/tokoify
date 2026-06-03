import { Request, Response, NextFunction } from 'express';
import { env } from '@/config/env';
import { authService } from './auth.service';
import { successResponse } from '@/utils/response.utils';
import { UnauthorizedError } from '@/utils/errors';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      successResponse(res, null, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const deviceInfo = req.headers['user-agent'];

      const { user, accessToken, refreshToken } = await authService.login(
        req.body,
        ipAddress,
        deviceInfo
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1/auth',
      });

      successResponse(
        res,
        { user, accessToken },
        'Login berhasil',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oldToken = req.cookies.refreshToken;
      if (!oldToken) {
        throw new UnauthorizedError('Sesi tidak ditemukan');
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const deviceInfo = req.headers['user-agent'];

      const { accessToken, refreshToken } = await authService.refreshToken(
        oldToken,
        ipAddress,
        deviceInfo
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      successResponse(res, { accessToken }, 'Token berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (token) {
        await authService.logout(token);
      }

      res.clearCookie('refreshToken', {
        path: '/api/v1/auth',
      });

      successResponse(res, null, 'Logout berhasil', 200);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      if (!token) {
        throw new UnauthorizedError('Token verifikasi tidak valid');
      }

      await authService.verifyEmail(token);
      res.redirect(`${env.FRONTEND_URL}/login?verified=true`);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      successResponse(res, null, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resetPassword(req.body);
      successResponse(res, null, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      // Fetch fresh details from DB/request
      successResponse(res, req.user, 'Detail profil berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
