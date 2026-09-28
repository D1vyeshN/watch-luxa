import { WebhookEvent } from '@models/webhookEvent.model';
import { Order } from '@models/order.model';
import { logger } from '@config/logger';

export class WebhookService {
  /**
   * Check if this event has already been processed.
   * Uses MongoDB unique index for atomic dedup.
   */
  async isEventProcessed(
    provider: 'stripe' | 'razorpay',
    eventId: string
  ): Promise<boolean> {
    const existing = await WebhookEvent.findOne({ provider, eventId });
    return Boolean(existing);
  }

  /**
   * Record an event as processed. Throws on duplicate (unique index).
   */
  async recordEvent(
    provider: 'stripe' | 'razorpay',
    eventId: string,
    eventType: string,
    payload?: Record<string, unknown>
  ): Promise<void> {
    try {
      await WebhookEvent.create({
        provider,
        eventId,
        eventType,
        payload,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate — already recorded. Safe to ignore.
        logger.warn(
          { provider, eventId },
          'Webhook event already recorded — skipping'
        );
        return;
      }
      throw error;
    }
  }

  /**
   * Handle Stripe payment_intent.succeeded.
   */
  async handleStripePaymentSucceeded(intent: {
    id: string;
    metadata: Record<string, string>;
    amount_received: number;
  }): Promise<void> {
    const orderId = intent.metadata?.orderId;
    if (!orderId) {
      logger.warn({ intentId: intent.id }, 'Stripe intent missing orderId');
      return;
    }

    // Atomic update: only mark paid if not already paid
    const result = await Order.updateOne(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      {
        $set: {
          paymentStatus: 'paid',
          orderStatus: 'paid',
          paidAt: new Date(),
          paymentMethod: 'stripe',
          paymentIntentId: intent.id,
        },
        $push: {
          timeline: {
            status: 'paid',
            at: new Date(),
            by: 'stripe-webhook',
            note: `Payment received: ${intent.amount_received / 100}`,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      logger.info(
        { orderId },
        'Stripe webhook: order already paid — skipped'
      );
      return;
    }

    logger.info({ orderId, intentId: intent.id }, 'Order marked as paid');
  }

  /**
   * Handle Stripe payment_intent.payment_failed.
   */
  async handleStripePaymentFailed(intent: {
    id: string;
    metadata: Record<string, string>;
    last_payment_error?: { message: string };
  }): Promise<void> {
    const orderId = intent.metadata?.orderId;
    if (!orderId) return;

    await Order.updateOne(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      {
        $set: { paymentStatus: 'failed' },
        $push: {
          timeline: {
            status: 'pending',
            at: new Date(),
            by: 'stripe-webhook',
            note: `Payment failed: ${intent.last_payment_error?.message || 'unknown'}`,
          },
        },
      }
    );

    logger.warn({ orderId, intentId: intent.id }, 'Payment failed');
  }

  /**
   * Handle Razorpay payment.captured.
   */
  async handleRazorpayPaymentCaptured(payment: {
    id: string;
    order_id: string;
    amount: number;
    notes?: Record<string, string>;
  }): Promise<void> {
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      logger.warn({ paymentId: payment.id }, 'Razorpay payment missing orderId');
      return;
    }

    const result = await Order.updateOne(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      {
        $set: {
          paymentStatus: 'paid',
          orderStatus: 'paid',
          paidAt: new Date(),
          paymentMethod: 'razorpay',
          paymentIntentId: payment.order_id,
        },
        $push: {
          timeline: {
            status: 'paid',
            at: new Date(),
            by: 'razorpay-webhook',
            note: `Payment received: ₹${payment.amount / 100}`,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      logger.info({ orderId }, 'Razorpay webhook: order already paid');
      return;
    }

    logger.info(
      { orderId, paymentId: payment.id },
      'Order marked as paid (Razorpay)'
    );
  }

  /**
   * Handle Razorpay payment.failed.
   */
  async handleRazorpayPaymentFailed(payment: {
    id: string;
    order_id: string;
    notes?: Record<string, string>;
    error_description?: string;
  }): Promise<void> {
    const orderId = payment.notes?.orderId;
    if (!orderId) return;

    await Order.updateOne(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      {
        $set: { paymentStatus: 'failed' },
        $push: {
          timeline: {
            status: 'pending',
            at: new Date(),
            by: 'razorpay-webhook',
            note: `Payment failed: ${payment.error_description || 'unknown'}`,
          },
        },
      }
    );

    logger.warn({ orderId, paymentId: payment.id }, 'Razorpay payment failed');
  }
}

export const webhookService = new WebhookService();
