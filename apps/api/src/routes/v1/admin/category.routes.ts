import { Router } from 'express';
import { adminCategoryController } from '@controllers/admin/category.controller';
import { validate } from '@middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
} from '@validators/category.validator';

const router: Router = Router();

router.get(
  '/',
  validate(listCategoriesSchema),
  adminCategoryController.list
);

router.post(
  '/',
  validate(createCategorySchema),
  adminCategoryController.create
);

router.get('/:id', adminCategoryController.getById);

router.put(
  '/:id',
  validate(updateCategorySchema),
  adminCategoryController.update
);

router.delete('/:id', adminCategoryController.archive);

router.patch('/:id/restore', adminCategoryController.restore);

export default router;
