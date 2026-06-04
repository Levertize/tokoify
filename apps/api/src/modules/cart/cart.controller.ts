import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { successResponse } from '@/utils/response.utils';
import { UnauthorizedError } from '@/utils/errors';

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await cartService.getCart(req.user.id);
      successResponse(res, data, 'Isi keranjang berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await cartService.addToCart(req.user.id, req.body);
      successResponse(res, data, 'Item berhasil ditambahkan ke keranjang', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { itemId } = req.params;
      const { quantity } = req.body;
      const data = await cartService.updateQuantity(req.user.id, itemId as string, quantity);
      successResponse(res, data, 'Kuantitas item keranjang berhasil diubah', 200);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { itemId } = req.params;
      await cartService.removeItem(req.user.id, itemId as string);
      successResponse(res, null, 'Item keranjang berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await cartService.clearCart(req.user.id);
      successResponse(res, null, 'Keranjang berhasil dikosongkan', 200);
    } catch (error) {
      next(error);
    }
  }

  async validateCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await cartService.validateCartStock(req.user.id);
      successResponse(res, data, 'Validasi stok keranjang berhasil', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
export default cartController;
