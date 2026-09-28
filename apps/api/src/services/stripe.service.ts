import Stripe from 'stripe';
import { getStripe, STRIPE_CURRENCY } from '@config/stripe';
import { Order, IOrder } from '@models/order.model';
import { BadRequestError, NotFoundError } from '@utils/AppError';
import { logger } from '@config/logger';

export class StripeService {
  /**
   * Create a PaymentIntent for an order.
   * Idempotent: uses order._id as the key, so retries return the same intent.
   */
  async createPaymentIntent(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.paymentStatus === 'paid') {
      throw new BadRequestError('Order is already paid');
    }

    // If we already created an intent for this order, return it
    if (order.paymentIntentId) {
      const stripe = getStripe();
      const existing = await stripe.paymentIntents.retrieve(
        order.paymentIntentId
      );
      return this.formatIntent(existing, order);
    }

    const stripe = getStripe();

    // Deterministic idempotency key — safe under retries
    const idempotencyKey = `order-pi-${order._id.toString()}`;

    const intent = await stripe.paymentIntents.create(
      {
        amount: order.total,                  // already in paise
        currency: STRIPE_CURRENCY,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerEmail: order.guestEmail || order.shippingAddress.email,
        },
        description: `Order ${order.orderNumber}`,
        automatic_payment_methods: { enabled: true },
        receipt_email: order.guestEmail || order.shippingAddress.email,
      },
      { idempotencyKey }  // ← critical: prevents duplicate intents
    );

    // Persist intent ID on order
    order.paymentIntentId = intent.id;
    order.paymentMethod = 'stripe';
    await order.save();

    logger.info(
      { orderId: order._id, intentId: intent.id },
      'Stripe PaymentIntent created'
    );

    return this.formatIntent(intent, order);
  }

  /**
   * Retrieve an existing PaymentIntent (for polling after redirect).
   */
  async getPaymentIntentStatus(orderId: string): Promise<{
    status: string;
    orderStatus: string;
    paymentStatus: string;
    clientSecret?: string | null;
  }> {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (!order.paymentIntentId) {
      return { status: 'not_initiated', orderStatus: order.orderStatus, paymentStatus: order.paymentStatus };
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);

    return {
      status: intent.status,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      clientSecret: intent.client_secret || undefined,
    };
  }

  /**
   * Verify webhook signature and return the parsed event.
   * Uses Stripe SDK's constructEvent with the raw body.
   */
  verifyWebhook(rawBody: Buffer, signature: string): Stripe.Event {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (error: any) {
      logger.error({ error }, 'Stripe webhook signature verification failed');
      throw new BadRequestError(
        `Webhook signature verification failed: ${error.message}`
      );
    }
  }

  private formatIntent(intent: any, order: IOrder) {
    return {
      intentId: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      orderNumber: order.orderNumber,
    };
  }
}

export const stripeService = new StripeService();
