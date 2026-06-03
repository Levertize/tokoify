import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import categoryRoutes from '@/modules/categories/category.routes';
import productRoutes from '@/modules/products/product.routes';
import cartRoutes from '@/modules/cart/cart.routes';
import wishlistRoutes from '@/modules/wishlist/wishlist.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
