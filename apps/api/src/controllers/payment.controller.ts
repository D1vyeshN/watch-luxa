import { Request, Response } from 'express';
import { stripeService } from '@services/stripe.service';
import { razorpayService } from '@services/razorpay.service';
import { webhookService } from '@services/webhook.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { BadRequestError } from '@utils/AppError';
import { logger } from '@config/logger';

export const paymentController: Record<string, any> = {
  // ─────────────────────────────────────────────────────────
  // STRIPE
  // ─────────────────────────────────────────────────────────

  /**
   * POST /api/v1/payments/stripe/intent
   * Body: { orderId }
   */
  createStripeIntent: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.body;
    if (!orderId) throw new BadRequestError('orderId is required');

    const intent = await stripeService.createPaymentIntent(orderId);
    return sendSuccess(res, intent, 'Payment intent created', 201);
  }),

  /**
   * GET /api/v1/payments/stripe/status/:orderId
   * Poll for payment status after redirect.
   */
  getStripeStatus: asyncHandler(async (req: Request, res: Response) => {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const status = await stripeService.getPaymentIntentStatus(orderId);
    return sendSuccess(res, status, 'Payment status');
  }),

  /**
   * POST /api/v1/payments/stripe/webhook
   * Raw body — signature verification in the controller.
   */
  stripeWebhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) throw new BadRequestError('Missing stripe-signature header');
    const signatureString = Array.isArray(signature) ? signature[0] : signature;

    const event = stripeService.verifyWebhook(req.body, signatureString);

    // Dedup check
    const alreadyProcessed = await webhookService.isEventProcessed(
      'stripe',
      event.id
    );
    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await webhookService.handleStripePaymentSucceeded(event.data.object as any);
        break;
      case 'payment_intent.payment_failed':
        await webhookService.handleStripePaymentFailed(event.data.object as any);
        break;
      default:
        logger.info({ type: event.type }, 'Unhandled Stripe event');
    }

    // Record AFTER successful handling
    await webhookService.recordEvent(
      'stripe',
      event.id,
      event.type,
      { orderId: (event.data.object as any)?.metadata?.orderId }
    );

    return res.status(200).json({ received: true });
  }),

  // ─────────────────────────────────────────────────────────
  // RAZORPAY
  // ─────────────────────────────────────────────────────────

  /**
   * POST /api/v1/payments/razorpay/order
   * Body: { orderId }
   */
  createRazorpayOrder: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.body;
    if (!orderId) throw new BadRequestError('orderId is required');

    const result = await razorpayService.createOrder(orderId);
    return sendSuccess(res, result, 'Razorpay order created', 201);
  }),

  /**
   * POST /api/v1/payments/razorpay/verify
   * Called by the client after Checkout.js success.
   * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   */
  verifyRazorpayPayment: asyncHandler(async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestError('Missing Razorpay verification fields');
    }

    const valid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!valid) {
      throw new BadRequestError('Invalid payment signature');
    }

    // Fetch order by paymentIntentId instead
    const { Order } = await import('@models/order.model');
    const dbOrder = await Order.findOne({ paymentIntentId: razorpay_order_id });
    if (!dbOrder) throw new BadRequestError('Order not found');

    // Update order (idempotent)
    await Order.updateOne(
      { _id: dbOrder._id, paymentStatus: { $ne: 'paid' } },
      {
        $set: {
          paymentStatus: 'paid',
          orderStatus: 'paid',
          paidAt: new Date(),
          paymentIntentId: razorpay_payment_id,
        },
        $push: {
          timeline: {
            status: 'paid',
            at: new Date(),
            by: 'razorpay-client',
            note: 'Payment verified via Razorpay signature',
          },
        },
      }
    );

    return sendSuccess(res, { verified: true }, 'Payment verified');
  }),

  /**
   * POST /api/v1/payments/razorpay/webhook
   * Raw body — signature verification in the controller.
   */
  razorpayWebhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) throw new BadRequestError('Missing signature header');
    const signatureString = Array.isArray(signature) ? signature[0] : signature;

    const valid = razorpayService.verifyWebhookSignature(req.body, signatureString);
    if (!valid) {
      logger.warn('Razorpay webhook signature invalid');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());

    // Dedup check
    const alreadyProcessed = await webhookService.isEventProcessed(
      'razorpay',
      event.id || event.event_id
    );
    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // Handle the event
    switch (event.event) {
      case 'payment.captured':
        await webhookService.handleRazorpayPaymentCaptured(
          event.payload.payment.entity
        );
        break;
      case 'payment.failed':
        await webhookService.handleRazorpayPaymentFailed(
          event.payload.payment.entity
        );
        break;
      default:
        logger.info({ event: event.event }, 'Unhandled Razorpay event');
    }

    // Record AFTER successful handling
    await webhookService.recordEvent(
      'razorpay',
      event.id || event.event_id,
      event.event,
      { orderId: event.payload?.payment?.entity?.notes?.orderId }
    );

    return res.status(200).json({ received: true });
  }),
};
