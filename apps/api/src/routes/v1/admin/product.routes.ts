import { Router } from 'express';
import { adminProductController } from '@controllers/admin/product.controller';
import { validate } from '@middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  addVariantSchema,
  updateVariantSchema,
  adjustStockSchema,
  setStockSchema,
  generateMatrixSchema,
} from '@validators/product.validator';

const router: Router = Router();

// ─── Product CRUD ───
router.get('/', validate(listProductsSchema), adminProductController.list);
router.post('/', validate(createProductSchema), adminProductController.create);

// ─── Inventory (must be before /:id) ───
router.get('/inventory', adminProductController.inventory);

// ─── Product by ID ───
router.get('/:id', adminProductController.getById);
router.put(
  '/:id',
  validate(updateProductSchema),
  adminProductController.update
);
router.delete('/:id', adminProductController.archive);
router.patch('/:id/restore', adminProductController.restore);
router.patch('/:id/publish', adminProductController.publish);

// ─── Variant Operations ───
router.post(
  '/:id/variants',
  validate(addVariantSchema),
  adminProductController.addVariant
);
router.put(
  '/:id/variants/:variantId',
  validate(updateVariantSchema),
  adminProductController.updateVariant
);
router.delete(
  '/:id/variants/:variantId',
  adminProductController.removeVariant
);

// ─── Stock ───
router.patch(
  '/:id/variants/:variantId/stock/adjust',
  validate(adjustStockSchema),
  adminProductController.adjustStock
);
router.patch(
  '/:id/variants/:variantId/stock',
  validate(setStockSchema),
  adminProductController.setStock
);

// ─── Matrix Generator ⭐ ───
router.post(
  '/:id/variants/generate',
  validate(generateMatrixSchema),
  adminProductController.generateMatrix
);

export default router;
