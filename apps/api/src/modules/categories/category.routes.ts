import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/role.middleware';
import { CreateCategorySchema, UpdateCategorySchema } from './category.schema';

const router: Router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryDetail);
router.post(
  '/',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(CreateCategorySchema),
  categoryController.createCategory
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(UpdateCategorySchema),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  categoryController.deleteCategory
);

export default router;
