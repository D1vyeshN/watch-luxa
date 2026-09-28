import crypto from 'crypto';
import { getRazorpay, RAZORPAY_CURRENCY } from '@config/razorpay';
import { Order } from '@models/order.model';
import { BadRequestError, NotFoundError } from '@utils/AppError';
import { logger } from '@config/logger';

export class RazorpayService {
  /**
   * Create a Razorpay Order for an existing Order.
   * Idempotent: returns existing razorpay order id if already created.
   */
  async createOrder(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.paymentStatus === 'paid') {
      throw new BadRequestError('Order is already paid');
    }

    // If Razorpay order already created, return it
    if (order.paymentIntentId) {
      return {
        razorpayOrderId: order.paymentIntentId,
        amount: order.total,
        currency: RAZORPAY_CURRENCY,
        orderNumber: order.orderNumber,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    }

    const razorpay = getRazorpay();

    const rzpOrder = await (razorpay as any).orders.create({
      amount: order.total,           // in paise
      currency: RAZORPAY_CURRENCY,
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.guestEmail || order.shippingAddress.email,
      },
    });

    order.paymentIntentId = rzpOrder.id;
    order.paymentMethod = 'razorpay';
    await order.save();

    logger.info(
      { orderId: order._id, rzpOrderId: rzpOrder.id },
      'Razorpay order created'
    );

    return {
      razorpayOrderId: rzpOrder.id,
      amount: order.total,
      currency: RAZORPAY_CURRENCY,
      orderNumber: order.orderNumber,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify payment signature after checkout (client-side callback).
   * Signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return expected === signature;
  }

  /**
   * Verify webhook signature.
   * Signature = HMAC_SHA256(rawBody, webhook_secret)
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    return expected === signature;
  }
}

export const razorpayService = new RazorpayService();
