import { Response } from 'express';
import { ValidationError } from './errors';

// ==============================
// Standardized Response Helpers
// ==============================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const successResponse = (
  res: Response,
  data: unknown,
  message = 'Berhasil',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (
  res: Response,
  data: unknown[],
  meta: PaginationMeta,
  message = 'Berhasil'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: ValidationError[]
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Helper to calculate pagination meta from total count
 */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
