import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Akses ditolak. Anda harus login terlebih dahulu.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Anda tidak memiliki izin untuk mengakses resource ini.'));
    }

    next();
  };
};

export default authorize;
