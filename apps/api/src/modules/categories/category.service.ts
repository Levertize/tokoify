import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/redis';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '@/utils/errors';
import { CreateCategorySchema, UpdateCategorySchema } from './category.schema';
import { z } from 'zod';

type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters except word, whitespace, hyphen
    .replace(/[\s_]+/g, '-') // replace space and underscore with hyphen
    .replace(/-+/g, '-'); // collapse multiple hyphens
};

export class CategoryService {
  private readonly cacheKey = 'categories:all';

  /**
   * Get all categories formatted as a tree
   */
  async getCategories(): Promise<any> {
    const cached = await getCache<any>(this.cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: { where: { isActive: true, isApproved: true } } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const formatted = categories.map((parent) => ({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      image: parent.image,
      children: parent.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        image: child.image,
        productCount: child._count.products,
      })),
    }));

    await setCache(this.cacheKey, formatted, 3600); // 1 hour TTL
    return formatted;
  }

  /**
   * Get category detail
   */
  async getCategoryDetail(id: string): Promise<any> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: { where: { isActive: true, isApproved: true } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Kategori');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      isActive: category.isActive,
      productCount: category._count.products,
      createdAt: category.createdAt,
    };
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryInput): Promise<any> {
    const slug = generateSlug(data.name);

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictError('Kategori dengan nama/slug ini sudah terdaftar');
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new NotFoundError('Parent kategori');
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
      },
    });

    await deleteCache(this.cacheKey);
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryInput): Promise<any> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Kategori');
    }

    const updateData: any = { ...data };

    if (data.name) {
      const slug = generateSlug(data.name);
      const existing = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });

      if (existing) {
        throw new ConflictError('Kategori dengan nama/slug ini sudah terdaftar');
      }
      updateData.slug = slug;
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new BadRequestError('Kategori tidak bisa menjadi sub-kategori dirinya sendiri');
      }
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new NotFoundError('Parent kategori');
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    await deleteCache(this.cacheKey);
    return updated;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundError('Kategori');
    }

    // Check products in this category or subcategories
    const categoryIds = [id, ...category.children.map((c) => c.id)];

    const activeProductCount = await prisma.product.count({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
        deletedAt: null,
      },
    });

    if (activeProductCount > 0) {
      throw new BadRequestError(
        'Kategori tidak dapat dihapus karena masih memiliki produk aktif'
      );
    }

    // Check if it has subcategories
    if (category.children.length > 0) {
      // Re-parent subcategories to null or delete them if desired.
      // Based on typical behavior, we delete them or prevent deletion. Let's prevent to be safe:
      throw new BadRequestError(
        'Kategori tidak dapat dihapus karena memiliki sub-kategori. Hapus sub-kategori terlebih dahulu.'
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    await deleteCache(this.cacheKey);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
