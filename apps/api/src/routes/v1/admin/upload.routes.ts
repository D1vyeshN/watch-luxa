import { Router, type Router as RouterType } from 'express';
import { adminUploadController } from '@controllers/admin/upload.controller';
import { uploadSingle, uploadMultiple } from '@middleware/upload.middleware';
import { validate } from '@middleware/validate.middleware';
import { z } from 'zod';

const router: RouterType = Router();

const deleteUploadsSchema = z.object({
  body: z.object({
    urls: z.array(z.string().url()).min(1, 'At least one URL is required'),
  }),
});

// POST /api/v1/admin/uploads/single
router.post(
  '/single',
  uploadSingle,
  adminUploadController.single
);

// POST /api/v1/admin/uploads/multiple
router.post(
  '/multiple',
  uploadMultiple,
  adminUploadController.multiple
);

// DELETE /api/v1/admin/uploads
router.delete(
  '/',
  validate(deleteUploadsSchema),
  adminUploadController.delete
);

export default router;
