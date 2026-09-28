import mongoose, { Types } from 'mongoose';
import { cartRepository } from '@repositories/cart.repository';
import { orderRepository } from '@repositories/order.repository';
import { Product } from '@models/product.model';
// import { Coupon } from '@models/coupon.model'; // will build later — see note
import { IOrder, IOrderItem, IShippingAddress } from '@models/order.model';
import {
  calculateTotals,
  CartLineForCalc,
} from '@utils/checkoutCalculator';
import { generateOrderNumber } from '@utils/orderNumber';
import {
  BadRequestError,
  ConflictError,
} from '@utils/AppError';
import { logger } from '@config/logger';

interface CheckoutInput {
  owner: { userId?: string; sessionId?: string };
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  // couponCode?: string; // TODO: Uncomment when coupon module is built
  customerNote?: string;
}

export class CheckoutService {
  /**
   * Convert cart → order. Atomic transaction:
   * 1. Validate all items and stock
   * 2. Deduct stock atomically
   * 3. Create order
   * 4. Clear cart
   */
  async createOrder(input: CheckoutInput): Promise<IOrder> {
    const { owner, shippingAddress, billingAddress, customerNote } = input;

    // 1. Load cart
    const cart = await cartRepository.findByOwner(owner);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // 2. Load all products for validation
    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. Validate each item + build order items + stock adjustments
    const orderItems: IOrderItem[] = [];
    const cartLines: CartLineForCalc[] = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId.toString());
      if (!product || product.status !== 'active') {
        throw new BadRequestError(
          `"${cartItem.productName}" is no longer available`
        );
      }

      const variant = product.variants.find(
        (v) => v._id.toString() === cartItem.variantId.toString()
      );

      if (!variant || !variant.isActive) {
        throw new BadRequestError(
          `Variant for "${cartItem.productName}" is no longer available`
        );
      }

      if (variant.stock < cartItem.quantity) {
        throw new ConflictError(
          `Only ${variant.stock} units of "${cartItem.productName}" (${cartItem.variantLabel}) in stock`
        );
      }

      orderItems.push({
        _id: new Types.ObjectId(),
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        productName: cartItem.productName,
        productSlug: cartItem.productSlug,
        sku: variant.sku,
        variantLabel: cartItem.variantLabel,
        image: cartItem.image,
        quantity: cartItem.quantity,
        unitPrice: variant.price,
        totalPrice: variant.price * cartItem.quantity,
      });

      cartLines.push({ price: variant.price, quantity: cartItem.quantity });
    }

    // 4. Validate coupon (if provided)
    // NOTE: Coupon module not built yet - ignoring coupon codes for now
    let appliedCoupon: {
      type: 'percentage' | 'fixed';
      value: number;
      maxDiscount?: number;
      code: string;
    } | null = null;

    // 5. Calculate totals
    const totals = calculateTotals(cartLines, appliedCoupon || undefined);

    // 6. Generate order number
    const orderNumber = generateOrderNumber();

    // 7. Execute in transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 7a. Atomic stock deduction for each item
      for (const item of orderItems) {
        const result = await Product.updateOne(
          {
            _id: item.productId,
            'variants._id': item.variantId,
            'variants.stock': { $gte: item.quantity },
          },
          { $inc: { 'variants.$.stock': -item.quantity } },
          { session }
        );

        if (result.modifiedCount === 0) {
          throw new ConflictError(
            `Stock for "${item.productName}" (${item.variantLabel}) is no longer available`
          );
        }
      }

      // 7b. Create order
      const orderData: Partial<IOrder> = {
        orderNumber,
        userId: owner.userId ? new Types.ObjectId(owner.userId) : undefined,
        guestEmail: !owner.userId ? shippingAddress.email : undefined,
        items: orderItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        taxRate: totals.taxRate,
        shippingFee: totals.shippingFee,
        total: totals.total,
        currency: 'INR',
        // couponCode: appliedCoupon?.code, // TODO: Uncomment when coupon module is built
        paymentStatus: 'pending',
        orderStatus: 'pending',
        customerNote,
        timeline: [{ status: 'pending', at: new Date(), by: 'system' }],
      };

      const order = await orderRepository.create(orderData, session);

      // 7c. Increment coupon usage
      if (appliedCoupon) {
        // TODO: Uncomment when Coupon model is built
        // await Coupon.updateOne(
        //   { code: appliedCoupon.code },
        //   { $inc: { usedCount: 1 } },
        //   { session }
        // );
      }

      // 7d. Clear cart
      await cartRepository.clearCart(cart._id.toString());

      await session.commitTransaction();

      logger.info(
        { orderNumber, orderId: order._id, total: order.total },
        'Order created'
      );

      return order;
    } catch (error) {
      await session.abortTransaction();
      logger.error({ error, orderNumber }, 'Checkout failed — rolled back');
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get a summary of what checkout would cost — for the checkout page.
   * Does NOT create an order.
   */
  async getCheckoutSummary(owner: {
    userId?: string;
    sessionId?: string;
  }) {
    const cart = await cartRepository.findByOwner(owner);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const lines: CartLineForCalc[] = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId.toString());
      const variant = product?.variants.find(
        (v) => v._id.toString() === cartItem.variantId.toString()
      );

      if (!variant || !variant.isActive) {
        throw new BadRequestError(
          `"${cartItem.productName}" is no longer available`
        );
      }

      if (variant.stock < cartItem.quantity) {
        throw new ConflictError(
          `Only ${variant.stock} units of "${cartItem.productName}" in stock`
        );
      }

      lines.push({ price: variant.price, quantity: cartItem.quantity });
    }

    return {
      itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
      ...calculateTotals(lines),
    };
  }
}

export const checkoutService = new CheckoutService();
