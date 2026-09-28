import { Router, type Router as RouterType } from 'express';
import { checkoutController } from '@controllers/checkout.controller';
import { optionalAuth, requireCartOwner } from '@middleware/optionalAuth.middleware';
import { validate } from '@middleware/validate.middleware';
import { checkoutSchema, trackOrderSchema } from '@validators/order.validator';

const router: RouterType = Router();

// ─── Checkout ───
router.get(
  '/summary',
  optionalAuth,
  requireCartOwner,
  checkoutController.summary
);

router.post(
  '/',
  optionalAuth,
  requireCartOwner,
  validate(checkoutSchema),
  checkoutController.createOrder
);

// ─── Order Tracking (public) ───
router.get(
  '/track/:orderNumber',
  validate(trackOrderSchema),
  checkoutController.trackOrder
);

export default router;
