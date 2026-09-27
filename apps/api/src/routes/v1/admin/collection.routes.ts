import { Router } from 'express';
import { adminCollectionController } from '@controllers/admin/collection.controller';
import { validate } from '@middleware/validate.middleware';
import {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsSchema,
  addProductsSchema,
  removeProductsSchema,
} from '@validators/collection.validator';

const router = Router();

// ─── Collection CRUD ───
router.get(
  '/',
  validate(listCollectionsSchema),
  adminCollectionController.list
);
router.post(
  '/',
  validate(createCollectionSchema),
  adminCollectionController.create
);

router.get('/:id', adminCollectionController.getById);
router.put(
  '/:id',
  validate(updateCollectionSchema),
  adminCollectionController.update
);
router.delete('/:id', adminCollectionController.archive);
router.patch('/:id/restore', adminCollectionController.restore);

// ─── Product Management ───
router.post(
  '/:id/products',
  validate(addProductsSchema),
  adminCollectionController.addProducts
);
router.delete(
  '/:id/products',
  validate(removeProductsSchema),
  adminCollectionController.removeProducts
);

export default router;