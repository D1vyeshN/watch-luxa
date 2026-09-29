import { Router } from 'express';
import { adminCouponController } from '@controllers/admin/coupon.controller';
import { validate } from '@middleware/validate.middleware';
import {
  createCouponSchema,
  updateCouponSchema,
  listCouponsSchema,
} from '@validators/coupon.validator';

const router: Router = Router();

router.get('/', validate(listCouponsSchema), adminCouponController.list);
router.post('/', validate(createCouponSchema), adminCouponController.create);
router.get('/:id', adminCouponController.getById);
router.put(
  '/:id',
  validate(updateCouponSchema),
  adminCouponController.update
);
router.patch('/:id/deactivate', adminCouponController.deactivate);
router.patch('/:id/reactivate', adminCouponController.reactivate);
router.delete('/:id', adminCouponController.delete);

export default router;
