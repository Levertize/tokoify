import { Request } from 'express';

/**
 * Augment Express Request type with custom properties.
 * This will be expanded as auth middleware is built.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
