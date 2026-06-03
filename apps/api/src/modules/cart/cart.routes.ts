import { Router } from 'express';
import { cartController } from './cart.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { AddToCartSchema, UpdateQuantitySchema } from './cart.schema';

const router = Router();

router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, validate(AddToCartSchema), cartController.addToCart);
router.put('/:itemId', authenticate, validate(UpdateQuantitySchema), cartController.updateQuantity);
router.delete('/:itemId', authenticate, cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);
router.post('/validate', authenticate, cartController.validateCart);

export default router;
