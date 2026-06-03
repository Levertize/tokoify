import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { successResponse } from '@/utils/response.utils';

export class CategoryController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories();
      successResponse(res, categories, 'Daftar kategori berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.getCategoryDetail(req.params.id as string);
      successResponse(res, category, 'Detail kategori berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      successResponse(res, category, 'Kategori berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.updateCategory(req.params.id as string, req.body);
      successResponse(res, category, 'Kategori berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoryService.deleteCategory(req.params.id as string);
      successResponse(res, null, 'Kategori berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
export default categoryController;
