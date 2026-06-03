import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { successResponse, paginatedResponse } from '@/utils/response.utils';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, meta } = await productService.getProducts(req.query as any);
      paginatedResponse(res, data, meta, 'Daftar produk berhasil diambil');
    } catch (error) {
      next(error);
    }
  }

  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      const suggestions = await productService.getSuggestions(q as string);
      successResponse(res, suggestions, 'Suggestions pencarian berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async getProductDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductDetail(req.params.slug as string);
      successResponse(res, product, 'Detail produk berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const product = await productService.createProduct(
        req.user.id,
        req.user.role,
        req.body
      );
      successResponse(res, product, 'Produk berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const product = await productService.updateProduct(
        req.params.id as string,
        req.user.id,
        req.user.role,
        req.body
      );
      successResponse(res, product, 'Produk berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await productService.deleteProduct(req.params.id as string, req.user.id, req.user.role);
      successResponse(res, null, 'Produk berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError('Tidak ada file gambar yang diunggah');
      }

      const images = await productService.uploadProductImages(
        req.params.id as string,
        req.user.id,
        req.user.role,
        req.files as Express.Multer.File[]
      );

      successResponse(res, images, 'Gambar produk berhasil diunggah', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await productService.deleteProductImage(
        req.params.id as string,
        req.params.imageId as string,
        req.user.id,
        req.user.role
      );
      successResponse(res, null, 'Gambar produk berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const variant = await productService.updateVariant(
        req.params.id as string,
        req.params.variantId as string,
        req.user.id,
        req.user.role,
        req.body
      );
      successResponse(res, variant, 'Varian produk berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
export default productController;
