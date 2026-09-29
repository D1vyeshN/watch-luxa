import { Router, type Router as RouterType } from 'express';
import { adminReturnController } from '@controllers/admin/return.controller';
import { validate } from '@middleware/validate.middleware';
import {
  listReturnsSchema,
  rejectReturnSchema,
  refundReturnSchema,
  adminNoteSchema,
} from '@validators/return.validator';

const router: RouterType = Router();

router.get('/', validate(listReturnsSchema), adminReturnController.list);
router.get('/:id', adminReturnController.getById);
router.patch(
  '/:id/approve',
  validate(adminNoteSchema),
  adminReturnController.approve
);
router.patch(
  '/:id/reject',
  validate(rejectReturnSchema),
  adminReturnController.reject
);
router.patch(
  '/:id/received',
  validate(adminNoteSchema),
  adminReturnController.markReceived
);
router.patch(
  '/:id/refund',
  validate(refundReturnSchema),
  adminReturnController.refund
);

export default router;
