import { prisma } from '@/lib/prisma';
import { NotFoundError, BusinessError } from '@/utils/errors';

export class CartService {
  /**
   * Get active user's cart items
   */
  async getCart(userId: string): Promise<any[]> {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: {
                  select: { id: true, url: true, isPrimary: true },
                },
                category: { select: { id: true, name: true } },
                seller: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => {
      const product = item.variant.product;
      const primaryImage = product.images.find((img) => img.isPrimary)?.url || 
        (product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop');

      return {
        id: item.id,
        userId: item.userId,
        variantId: item.variantId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        variant: {
          id: item.variant.id,
          sku: item.variant.sku,
          options: item.variant.options,
          price: Number(item.variant.price),
          stock: item.variant.stock,
          isActive: item.variant.isActive,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            basePrice: Number(product.basePrice),
            imageUrl: primaryImage,
            seller: product.seller,
            category: product.category,
          },
        },
      };
    });
  }

  /**
   * Add an item to the cart
   */
  async addToCart(
    userId: string,
    data: { variantId: string; quantity: number }
  ): Promise<any> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: { product: true },
    });

    if (
      !variant ||
      !variant.isActive ||
      !variant.product.isActive ||
      !variant.product.isApproved ||
      variant.product.deletedAt
    ) {
      throw new NotFoundError('Varian produk');
    }

    if (variant.stock < data.quantity) {
      throw new BusinessError('Stok produk tidak mencukupi');
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: { userId, variantId: data.variantId },
      },
    });

    let cartItem;
    if (existingItem) {
      const newQty = existingItem.quantity + data.quantity;
      if (variant.stock < newQty) {
        throw new BusinessError('Stok produk tidak mencukupi');
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
      });
    }

    return cartItem;
  }

  /**
   * Update quantity of a cart item
   */
  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<any> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundError('Item keranjang');
    }

    const variant = cartItem.variant;
    if (
      !variant.isActive ||
      !variant.product.isActive ||
      variant.product.deletedAt
    ) {
      throw new BusinessError('Produk tidak lagi aktif');
    }

    if (variant.stock < quantity) {
      throw new BusinessError('Stok produk tidak mencukupi');
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /**
   * Remove a single item from the cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundError('Item keranjang');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Clear all items from user's cart
   */
  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  /**
   * Check stock of all items in cart before checkout
   */
  async validateCartStock(userId: string): Promise<{ items: any[]; isValid: boolean }> {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    let isValid = true;
    const validatedItems = items.map((item) => {
      const variant = item.variant;
      const isStockSufficient = variant.stock >= item.quantity;
      const isProductAvailable =
        variant.isActive &&
        variant.product.isActive &&
        !variant.product.deletedAt;

      const itemValid = isStockSufficient && isProductAvailable;
      if (!itemValid) {
        isValid = false;
      }

      let message = 'Stok mencukupi';
      if (!isProductAvailable) {
        message = 'Produk tidak tersedia';
      } else if (!isStockSufficient) {
        message = `Stok tidak mencukupi (Tersisa: ${variant.stock})`;
      }

      return {
        itemId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        stock: variant.stock,
        isValid: itemValid,
        message,
      };
    });

    return {
      items: validatedItems,
      isValid,
    };
  }
}

export const cartService = new CartService();
export default cartService;
