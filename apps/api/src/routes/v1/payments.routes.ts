import express, { type Router as RouterType } from 'express';
import { paymentController } from '@controllers/payment.controller';
import { optionalAuth, requireCartOwner } from '@middleware/optionalAuth.middleware';
import { validate } from '@middleware/validate.middleware';
import { z } from 'zod';

const router: RouterType = express.Router();

const createIntentSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order ID'),
  }),
});

// ─────────────────────────────────────────────────────────
// WEBHOOKS (must come FIRST — raw body required)
// ─────────────────────────────────────────────────────────

// Stripe webhook — raw body
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

// Razorpay webhook — raw body
router.post(
  '/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.razorpayWebhook
);

// ─────────────────────────────────────────────────────────
// STRIPE (client-facing)
// ─────────────────────────────────────────────────────────

router.post(
  '/stripe/intent',
  optionalAuth,
  requireCartOwner,
  validate(createIntentSchema),
  paymentController.createStripeIntent
);

router.get(
  '/stripe/status/:orderId',
  optionalAuth,
  paymentController.getStripeStatus
);

// ─────────────────────────────────────────────────────────
// RAZORPAY (client-facing)
// ─────────────────────────────────────────────────────────

router.post(
  '/razorpay/order',
  optionalAuth,
  requireCartOwner,
  validate(createIntentSchema),
  paymentController.createRazorpayOrder
);

router.post(
  '/razorpay/verify',
  optionalAuth,
  paymentController.verifyRazorpayPayment
);

export default router;
