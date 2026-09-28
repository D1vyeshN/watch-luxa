import { Router, type Router as RouterType } from 'express';
import { adminOrderController } from '@controllers/admin/order.controller';
import { validate } from '@middleware/validate.middleware';
import {
  listOrdersSchema,
  updateOrderStatusSchema,
  updateTrackingSchema,
} from '@validators/order.validator';

const router: RouterType = Router();

router.get('/', validate(listOrdersSchema), adminOrderController.list);
router.get('/:id', adminOrderController.getById);
router.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  adminOrderController.updateStatus
);
router.patch(
  '/:id/tracking',
  validate(updateTrackingSchema),
  adminOrderController.updateTracking
);

export default router;
