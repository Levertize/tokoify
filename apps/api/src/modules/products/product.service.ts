import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@/utils/errors';
import { buildPaginationMeta } from '@/utils/response.utils';
import { generateSlug } from '@/modules/categories/category.service';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
  UpdateVariantSchema,
} from './product.schema';

type CreateProductInput = z.infer<typeof CreateProductSchema>;
type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
type UpdateVariantInput = z.infer<typeof UpdateVariantSchema>;

export class ProductService {
  /**
   * Get list of products with filters, sorting and pagination
   */
  async getProducts(query: ProductQueryInput): Promise<any> {
    const {
      page,
      limit,
      categoryId,
      minPrice,
      maxPrice,
      q,
      sortBy,
      sortOrder,
      sellerId,
      isActive,
    } = query;

    const offset = (page - 1) * limit;

    // Build Prisma query condition
    const where: any = {
      deletedAt: null,
    };

    // Filter status (default: only active + approved products)
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
      where.isApproved = true;
    }

    if (categoryId) {
      // Find category and its subcategories
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: true },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Full-text search on name and description
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Sorting map
    const orderBy: any = {};
    if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'price') orderBy.basePrice = sortOrder;
    else if (sortBy === 'rating') orderBy.avgRating = sortOrder;
    else if (sortBy === 'soldCount') orderBy.soldCount = sortOrder;

    // Execute queries in transaction
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true } },
          images: { select: { id: true, url: true, isPrimary: true } },
          variants: { select: { price: true, stock: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => {
      // Find primary image
      const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];

      // Calculate lowest price from variants
      const variantPrices = product.variants.map((v) => Number(v.price));
      const basePriceNum = Number(product.basePrice);
      const lowestPrice =
        variantPrices.length > 0 ? Math.min(basePriceNum, ...variantPrices) : basePriceNum;

      // Calculate discount percent if basePrice is higher than lowestPrice
      const discountPercent =
        basePriceNum > lowestPrice
          ? Math.round(((basePriceNum - lowestPrice) / basePriceNum) * 100)
          : 0;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: basePriceNum,
        lowestPrice,
        discountPercent,
        primaryImage: primaryImg ? primaryImg.url : null,
        avgRating: Number(product.avgRating),
        reviewCount: product.reviewCount,
        soldCount: product.soldCount,
        isActive: product.isActive,
        category: product.category,
        seller: product.seller,
      };
    });

    const meta = buildPaginationMeta(page, limit, total);
    return { data: formattedProducts, meta };
  }

  /**
   * Get single product detail by slug
   */
  async getProductDetail(slug: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        images: { select: { id: true, url: true, isPrimary: true, sortOrder: true } },
        variants: true,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    const basePriceNum = Number(product.basePrice);
    const variantPrices = product.variants.map((v) => Number(v.price));
    const lowestPrice =
      variantPrices.length > 0 ? Math.min(basePriceNum, ...variantPrices) : basePriceNum;

    const discountPercent =
      basePriceNum > lowestPrice
        ? Math.round(((basePriceNum - lowestPrice) / basePriceNum) * 100)
        : 0;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: basePriceNum,
      lowestPrice,
      discountPercent,
      weight: product.weight,
      avgRating: Number(product.avgRating),
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
      tags: product.tags,
      isActive: product.isActive,
      isApproved: product.isApproved,
      category: product.category,
      seller: product.seller,
      images: product.images.sort((a, b) => a.sortOrder - b.sortOrder),
      variants: product.variants,
      createdAt: product.createdAt,
    };
  }

  /**
   * Create a new product with variants in a transaction
   */
  async createProduct(
    userId: string,
    userRole: string,
    data: CreateProductInput
  ): Promise<any> {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new NotFoundError('Kategori');
    }

    // Auto-generate unique slug
    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Verify variant SKUs are unique globally
    const skus = data.variants.map((v) => v.sku);
    const existingSku = await prisma.productVariant.findFirst({
      where: { sku: { in: skus } },
    });
    if (existingSku) {
      throw new BadRequestError(`SKU '${existingSku.sku}' sudah digunakan pada produk lain`);
    }

    // Sanitize rich text description
    const sanitizedDescription = sanitizeHtml(data.description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
      },
    });

    const isApproved = userRole === 'admin' || userRole === 'super_admin';

    const product = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          sellerId: userId,
          categoryId: data.categoryId,
          name: data.name,
          slug,
          description: sanitizedDescription,
          basePrice: data.basePrice,
          weight: data.weight,
          tags: data.tags || [],
          isApproved,
          variants: {
            create: data.variants.map((v) => ({
              sku: v.sku,
              options: v.options,
              price: v.price,
              stock: v.stock,
            })),
          },
        },
        include: {
          variants: true,
        },
      });
    });

    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(
    productId: string,
    userId: string,
    userRole: string,
    data: UpdateProductInput
  ): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    // Ownership check
    if (userRole !== 'admin' && userRole !== 'super_admin' && product.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk memperbarui produk ini');
    }

    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
      const baseSlug = generateSlug(data.name);
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.product.findFirst({
          where: { slug, id: { not: productId } },
        });
        if (!existing) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
      updateData.slug = slug;
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundError('Kategori');
      }
      updateData.categoryId = data.categoryId;
    }

    if (data.description) {
      updateData.description = sanitizeHtml(data.description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height'],
        },
      });
    }

    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(productId: string, userId: string, userRole: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && product.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk menghapus produk ini');
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Upload multiple images for a product
   */
  async uploadProductImages(
    productId: string,
    userId: string,
    userRole: string,
    files: Express.Multer.File[]
  ): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && product.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk mengunggah gambar produk ini');
    }

    const currentCount = product.images.length;
    if (currentCount + files.length > 5) {
      throw new BadRequestError(`Batas unggah gambar adalah 5. Saat ini Anda memiliki ${currentCount} gambar.`);
    }

    const uploadedImages = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const folder = `tokoify/products/${productId}`;
        const { url, publicId } = await uploadToCloudinary(file.buffer, folder);

        // First image is primary if no images exist currently
        const isPrimary = currentCount === 0 && i === 0;

        const imgRecord = await prisma.productImage.create({
          data: {
            productId,
            url,
            isPrimary,
            sortOrder: currentCount + i,
          },
        });

        uploadedImages.push(imgRecord);
      }

      return uploadedImages;
    } catch (error) {
      // Cleanup uploads on failure if needed
      throw error;
    }
  }

  /**
   * Delete an image from product catalog
   */
  async deleteProductImage(
    productId: string,
    imageId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && product.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk menghapus gambar produk ini');
    }

    const image = product.images.find((img) => img.id === imageId);
    if (!image) {
      throw new NotFoundError('Gambar');
    }

    // Try deleting from Cloudinary (parse publicId from url)
    // URL format: https://res.cloudinary.com/cloud-name/image/upload/v12345/folder/public-id.jpg
    const parts = image.url.split('/upload/');
    if (parts.length > 1) {
      const publicIdWithExtension = parts[1]?.split('/').slice(1).join('/');
      if (publicIdWithExtension) {
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        await deleteFromCloudinary(publicId);
      }
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    // If we deleted the primary image, assign new primary if images still exist
    if (image.isPrimary && product.images.length > 1) {
      const remainingImages = product.images.filter((img) => img.id !== imageId);
      const newPrimary = remainingImages[0];
      if (newPrimary) {
        await prisma.productImage.update({
          where: { id: newPrimary.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  /**
   * Update variants price/stock
   */
  async updateVariant(
    productId: string,
    variantId: string,
    userId: string,
    userRole: string,
    data: UpdateVariantInput
  ): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundError('Produk');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && product.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke produk ini');
    }

    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundError('Varian');
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        price: data.price !== undefined ? data.price : variant.price,
        stock: data.stock !== undefined ? data.stock : variant.stock,
      },
    });

    return updated;
  }
}

export const productService = new ProductService();
export default productService;
