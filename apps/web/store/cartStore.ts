import { create } from 'zustand';
import apiClient from '@/lib/api';

export interface CartItem {
  id: string;
  userId: string;
  variantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  variant: {
    id: string;
    sku: string;
    options: any;
    price: number;
    stock: number;
    isActive: boolean;
    product: {
      id: string;
      name: string;
      slug: string;
      description: string;
      basePrice: number;
      imageUrl: string;
      seller: { id: string; name: string };
      category: { id: string; name: string };
    };
  };
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res: any = await apiClient.get('/cart');
      set({ items: res.data || [] });
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (variantId, quantity) => {
    try {
      await apiClient.post('/cart', { variantId, quantity });
      await get().fetchCart();
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  },

  updateQty: async (itemId, quantity) => {
    // Optimistic update locally
    const originalItems = get().items;
    set({
      items: originalItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });

    try {
      await apiClient.put(`/cart/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      // Rollback on error
      set({ items: originalItems });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    const originalItems = get().items;
    set({
      items: originalItems.filter((item) => item.id !== itemId),
    });

    try {
      await apiClient.delete(`/cart/${itemId}`);
      await get().fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      set({ items: originalItems });
      throw err;
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await apiClient.delete('/cart');
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export default useCartStore;
