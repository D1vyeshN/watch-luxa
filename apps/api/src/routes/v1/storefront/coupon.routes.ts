import { Router } from 'express';
import { couponController } from '@controllers/coupon.controller';
import { optionalAuth, requireCartOwner } from '@middleware/optionalAuth.middleware';
import { validate } from '@middleware/validate.middleware';
import { applyCouponSchema } from '@validators/coupon.validator';

const router: Router = Router();

// Public
router.get('/active', couponController.listActive);

// Cart-bound
router.post(
  '/apply',
  optionalAuth,
  requireCartOwner,
  validate(applyCouponSchema),
  couponController.apply
);

router.get(
  '/auto-apply',
  optionalAuth,
  requireCartOwner,
  couponController.autoApply
);

export default router;
