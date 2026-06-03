// ==============================
// Tokoify — Shared Types
// Types shared between frontend and backend
// ==============================

// ==============================
// Enums
// ==============================

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REFUND = 'refund',
}

export enum VoucherType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

// ==============================
// API Response Types
// ==============================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiValidationError[];
}

export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiValidationError {
  field: string;
  message: string;
}

// ==============================
// User Types
// ==============================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

// ==============================
// Product Types
// ==============================

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  primaryImage: string | null;
  category: { id: string; name: string };
  hasDiscount: boolean;
  discountPercent?: number;
}

export interface ProductVariantOption {
  [key: string]: string; // e.g. { color: "Merah", size: "XL" }
}

// ==============================
// Order Types
// ==============================

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

// ==============================
// Notification Types
// ==============================

export type NotificationType =
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'review_new'
  | 'wishlist_discount'
  | 'stock_low'
  | 'registration'
  | 'password_reset';
