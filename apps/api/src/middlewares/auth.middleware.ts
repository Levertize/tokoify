import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';
import { UnauthorizedError } from '@/utils/errors';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token tidak disediakan atau tidak valid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token tidak ditemukan');
    }

    // Determine verification options based on key format
    const isPem = env.JWT_PUBLIC_KEY.includes('-----BEGIN');
    const secretOrKey = isPem ? env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n') : env.JWT_PUBLIC_KEY;
    const algorithm = isPem ? 'RS256' : 'HS256';

    let decoded: any;
    try {
      decoded = jwt.verify(token, secretOrKey, { algorithms: [algorithm] });
    } catch (err) {
      throw new UnauthorizedError('Sesi tidak valid atau telah kedaluwarsa');
    }

    const userId = decoded.id || decoded.sub;
    if (!userId) {
      throw new UnauthorizedError('Payload token tidak valid');
    }

    const cacheKey = `user:profile:${userId}`;
    let user = await getCache<{ id: string; email: string; role: any; name: string }>(cacheKey);

    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: { id: true, email: true, role: true, name: true },
      });

      if (!dbUser) {
        throw new UnauthorizedError('Pengguna tidak ditemukan atau tidak aktif');
      }

      user = dbUser;
      await setCache(cacheKey, user, 300); // 5 minutes cache
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
