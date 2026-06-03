// ==============================
// Custom Error Classes
// ==============================

export interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: ValidationError[];

  constructor(message: string, statusCode: number, errors?: ValidationError[]) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: ValidationError[]) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} tidak ditemukan`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Terlalu banyak request. Silakan coba lagi nanti.') {
    super(message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Terjadi kesalahan pada server. Silakan coba lagi.') {
    super(message, 500);
  }
}
