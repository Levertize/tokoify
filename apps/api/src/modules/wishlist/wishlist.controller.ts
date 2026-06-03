import { Request, Response, NextFunction } from 'express';
import { wishlistService } from './wishlist.service';
import { successResponse } from '@/utils/response.utils';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';

export class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await wishlistService.getWishlist(req.user.id);
      successResponse(res, data, 'Daftar wishlist berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { productId } = req.body;
      if (!productId) {
        throw new BadRequestError('productId wajib disertakan');
      }
      const data = await wishlistService.toggleWishlist(req.user.id, productId);
      successResponse(res, data, data.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { productId } = req.params;
      await wishlistService.removeFromWishlist(req.user.id, productId);
      successResponse(res, null, 'Produk berhasil dihapus dari wishlist', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
export default wishlistController;
