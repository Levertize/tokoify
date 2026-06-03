import { Router } from 'express';
import { productController } from './product.controller';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/role.middleware';
import { uploadImages } from '@/middlewares/upload.middleware';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
  UpdateVariantSchema,
} from './product.schema';

const router: Router = Router();

router.get('/', validateQuery(ProductQuerySchema), productController.getProducts);
router.get('/search/suggestions', productController.getSuggestions);
router.get('/:slug', productController.getProductDetail);
router.post(
  '/',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  validate(CreateProductSchema),
  productController.createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  validate(UpdateProductSchema),
  productController.updateProduct
);
router.delete(
  '/:id',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  productController.deleteProduct
);
router.post(
  '/:id/images',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  uploadImages('images', 5),
  productController.uploadImages
);
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  productController.deleteImage
);
router.patch(
  '/:id/variants/:variantId',
  authenticate,
  authorize('seller', 'admin', 'super_admin'),
  validate(UpdateVariantSchema),
  productController.updateVariant
);

export default router;
