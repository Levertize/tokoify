import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router: Router = Router();

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/', authenticate, wishlistController.toggleWishlist);
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

export default router;
