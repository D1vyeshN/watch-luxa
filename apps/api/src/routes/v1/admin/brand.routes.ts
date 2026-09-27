import { Router } from 'express';
import { adminBrandController } from '@controllers/admin/brand.controller';
import { validate } from '@middleware/validate.middleware';
import {
  createBrandSchema,
  updateBrandSchema,
  listBrandsSchema,
} from '@validators/brand.validator';

const router: Router = Router();

// GET /api/v1/admin/brands
router.get(
  '/',
  validate(listBrandsSchema),
  adminBrandController.list
);

// POST /api/v1/admin/brands
router.post(
  '/',
  validate(createBrandSchema),
  adminBrandController.create
);

// GET /api/v1/admin/brands/:id
router.get('/:id', adminBrandController.getById);

// PUT /api/v1/admin/brands/:id
router.put(
  '/:id',
  validate(updateBrandSchema),
  adminBrandController.update
);

// DELETE /api/v1/admin/brands/:id (archives)
router.delete('/:id', adminBrandController.archive);

// PATCH /api/v1/admin/brands/:id/restore
router.patch('/:id/restore', adminBrandController.restore);

export default router;
