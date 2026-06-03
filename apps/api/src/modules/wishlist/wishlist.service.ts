import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/utils/errors';

export class WishlistService {
  /**
   * Get wishlist items of the user, formatted for the ProductCard
   */
  async getWishlist(userId: string): Promise<any[]> {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { select: { id: true, url: true, isPrimary: true } },
            category: { select: { id: true, name: true } },
            variants: { select: { price: true, stock: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return wishlistItems.map((item) => {
      const product = item.product;

      const primaryImage = product.images.find((img) => img.isPrimary)?.url || 
        (product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop');

      const basePriceNum = Number(product.basePrice);
      const variantPrices = product.variants.map((v) => Number(v.price));
      const lowestPrice = variantPrices.length > 0 ? Math.min(basePriceNum, ...variantPrices) : basePriceNum;
      const discountPercent = basePriceNum > lowestPrice ? Math.round(((basePriceNum - lowestPrice) / basePriceNum) * 100) : 0;
      const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category?.name || 'Umum',
        price: lowestPrice,
        originalPrice: basePriceNum > lowestPrice ? basePriceNum : undefined,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        imageUrl: primaryImage,
        avgRating: Number(product.avgRating),
        reviewCount: product.reviewCount,
        stock: totalStock,
      };
    });
  }

  /**
   * Toggle a product in user's wishlist
   */
  async toggleWishlist(
    userId: string,
    productId: string
  ): Promise<{ message: string; added: boolean }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt || !product.isActive) {
      throw new NotFoundError('Produk');
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { message: 'Produk dihapus dari wishlist', added: false };
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return { message: 'Produk ditambahkan ke wishlist', added: true };
    }
  }

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!existing) {
      throw new NotFoundError('Wishlist');
    }

    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
