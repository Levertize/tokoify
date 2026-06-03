// ==============================
// Application Constants
// ==============================

export const APP_NAME = 'Tokoify';

// Auth
export const BCRYPT_ROUNDS = 12;
export const JWT_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';
export const JWT_REFRESH_EXPIRY_REMEMBER = '30d';
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_EXPIRY_HOURS = 1;

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// File Upload
export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Order
export const ORDER_EXPIRY_HOURS = 24;
export const RETURN_WINDOW_DAYS = 7;
export const MAX_ADDRESSES_PER_USER = 5;

// Rate Limiting
export const RATE_LIMIT = {
  LOGIN: { windowMs: 60 * 1000, max: 5 },
  REGISTER: { windowMs: 60 * 1000, max: 3 },
  DEFAULT: { windowMs: 60 * 1000, max: 100 },
  UPLOAD: { windowMs: 60 * 1000, max: 10 },
} as const;

// API
export const API_PREFIX = '/api/v1';

// Cache TTL (seconds)
export const CACHE_TTL = {
  CATEGORIES: 3600,      // 1 hour
  POPULAR_PRODUCTS: 300,  // 5 minutes
  SHIPPING_RATES: 1800,   // 30 minutes
} as const;
