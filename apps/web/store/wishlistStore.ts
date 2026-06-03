import { create } from 'zustand';
import apiClient from '@/lib/api';

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  avgRating: number;
  reviewCount: number;
  stock: number;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res: any = await apiClient.get('/wishlist');
      set({ items: res.data || [] });
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      await apiClient.post('/wishlist', { productId });
      await get().fetchWishlist();
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  },

  isWishlisted: (productId) => {
    return get().items.some((item) => item.id === productId);
  },
}));

export default useWishlistStore;
