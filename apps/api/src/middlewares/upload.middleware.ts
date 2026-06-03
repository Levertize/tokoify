import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { BadRequestError } from '@/utils/errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const uploadImages = (fieldName: string, maxCount: number) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(
          new BadRequestError(
            'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.'
          ) as any
        );
      }
      cb(null, true);
    },
  }).array(fieldName, maxCount);

  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
              new BadRequestError(
                `Ukuran file terlalu besar. Maksimum limit adalah ${
                  MAX_SIZE / (1024 * 1024)
                }MB.`
              )
            );
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(
              new BadRequestError(
                `Jumlah file melebihi batas maksimum (${maxCount} gambar).`
              )
            );
          }
          return next(new BadRequestError(err.message));
        }
        return next(err);
      }
      next();
    });
  };
};

export default uploadImages;
