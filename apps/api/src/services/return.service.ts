import { Types } from 'mongoose';
import { returnRepository, FindManyOptions } from '@repositories/return.repository';
import { IReturn, IReturnItem, ReturnReason, ReturnStatus } from '@models/return.model';
import { Order } from '@models/order.model';
import { Product } from '@models/product.model';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '@utils/AppError';
import { generateReturnNumber } from '@utils/returnNumber';
import { logger } from '@config/logger';

const RETURN_WINDOW_DAYS = 14;

const VALID_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['in_transit', 'received', 'cancelled'], // admin can directly mark as received for in-person returns
  in_transit: ['received'],
  received: ['refunded'],
  rejected: [],
  refunded: [],
  cancelled: [],
};

interface CreateReturnInput {
  owner: { userId?: string; sessionId?: string };
  orderNumber: string;
  email: string;
  itemIds: string[];        // orderItemIds
  reason: ReturnReason;
  reasonDetail?: string;
  images?: string[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export class ReturnService {
  /**
   * Customer submits a return request.
   */
  async createReturn(input: CreateReturnInput): Promise<IReturn> {
    const {
      owner,
      orderNumber,
      email,
      itemIds,
      reason,
      reasonDetail,
      images,
      shippingAddress,
    } = input;

    // 1. Find the order
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
    });

    if (!order) throw new NotFoundError('Order not found');

    // 2. Verify ownership (either by userId or by email)
    if (owner.userId) {
      if (order.userId?.toString() !== owner.userId) {
        throw new ForbiddenError('You do not have access to this order');
      }
    } else {
      const orderEmail =
        order.guestEmail || order.shippingAddress.email;
      if (orderEmail.toLowerCase() !== email.toLowerCase()) {
        throw new ForbiddenError('Email does not match this order');
      }
    }

    // 3. Check order status
    if (order.orderStatus !== 'delivered') {
      throw new BadRequestError(
        'Only delivered orders can be returned'
      );
    }

    // 4. Check return window
    const deliveredAt = order.deliveredAt;
    if (!deliveredAt) {
      throw new BadRequestError('Order delivery date not recorded');
    }

    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new BadRequestError(
        `Return window has expired. Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery.`
      );
    }

    // 5. Validate item selection
    if (!itemIds.length) {
      throw new BadRequestError('Select at least one item to return');
    }

    const orderItems = order.items.filter((item) =>
      itemIds.includes(item._id.toString())
    );

    if (orderItems.length !== itemIds.length) {
      throw new BadRequestError('One or more items are not in this order');
    }

    // 6. Check for existing active return on these items
    const existingReturns = await returnRepository.findByOrderId(
      order._id.toString()
    );

    const activeReturns = existingReturns.filter(
      (r) =>
        !['rejected', 'cancelled', 'refunded'].includes(r.status)
    );

    const alreadyReturning = activeReturns.some((r) =>
      r.items.some((i) =>
        itemIds.includes(i.orderItemId.toString())
      )
    );

    if (alreadyReturning) {
      throw new ConflictError(
        'One or more items already have an active return request'
      );
    }

    // 7. Build return items
    const returnItems: IReturnItem[] = orderItems.map((item) => ({
      _id: new Types.ObjectId(),
      orderItemId: item._id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      sku: item.sku,
      variantLabel: item.variantLabel,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      restocked: false,
    }));

    // 8. Calculate refund amount
    const refundAmount = returnItems.reduce(
      (sum, i) => sum + i.totalPrice,
      0
    );

    // 9. Create the return
    const returnNumber = generateReturnNumber();

    const ret = await returnRepository.create({
      returnNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: owner.userId ? new Types.ObjectId(owner.userId) : undefined,
      guestEmail: !owner.userId ? email.toLowerCase() : undefined,
      items: returnItems,
      reason,
      reasonDetail,
      images: images || [],
      customerName: shippingAddress.fullName,
      customerPhone: shippingAddress.phone,
      customerEmail: email.toLowerCase(),
      shippingAddress,
      refundAmount,
      refundStatus: 'pending',
      status: 'pending',
      timeline: [
        { status: 'pending', at: new Date(), by: 'customer' },
      ],
    });

    logger.info(
      { returnId: ret._id, returnNumber, orderNumber },
      'Return request created'
    );

    return ret;
  }

  /**
   * Public: look up return by return number (customer can track).
   */
  async trackReturn(
    returnNumber: string,
    email?: string
  ): Promise<Partial<IReturn>> {
    const ret = await returnRepository.findByReturnNumber(returnNumber);
    if (!ret) throw new NotFoundError('Return not found');

    if (email) {
      if (ret.customerEmail.toLowerCase() !== email.toLowerCase()) {
        throw new NotFoundError('Return not found');
      }
    }

    return {
      returnNumber: ret.returnNumber,
      orderNumber: ret.orderNumber,
      status: ret.status,
      refundStatus: ret.refundStatus,
      refundAmount: ret.refundAmount,
      items: ret.items,
      reason: ret.reason,
      timeline: ret.timeline,
      createdAt: ret.createdAt,
    };
  }

  async getMyReturns(userId: string, options: FindManyOptions) {
    return returnRepository.findMany(
      { userId },
      { ...options, sort: { createdAt: -1 } }
    );
  }

  async getMyReturn(userId: string, returnId: string): Promise<IReturn> {
    const ret = await returnRepository.findById(returnId);
    if (!ret) throw new NotFoundError('Return not found');
    if (ret.userId?.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this return');
    }
    return ret;
  }

  /**
   * Customer cancels their own pending return.
   */
  async cancelOwnReturn(userId: string, returnId: string): Promise<IReturn> {
    const ret = await returnRepository.findById(returnId);
    if (!ret) throw new NotFoundError('Return not found');

    if (ret.userId?.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this return');
    }

    if (!['pending', 'approved'].includes(ret.status)) {
      throw new BadRequestError(
        `Cannot cancel a return with status "${ret.status}"`
      );
    }

    const updated = await returnRepository.update(returnId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      $push: {
        timeline: {
          status: 'cancelled',
          at: new Date(),
          by: 'customer',
        },
      },
    } as any);
    if (!updated) throw new NotFoundError('Return not found');
    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────────────────

  async listForAdmin(
    filter: any,
    options: FindManyOptions
  ) {
    return returnRepository.findMany(filter, options);
  }

  async adminGetById(id: string): Promise<IReturn> {
    const ret = await returnRepository.findById(id);
    if (!ret) throw new NotFoundError('Return not found');
    return ret;
  }

  /**
   * Admin approves the return request.
   */
  async approve(
    id: string,
    adminUserId: string,
    note?: string
  ): Promise<IReturn> {
    const ret = await returnRepository.findById(id);
    if (!ret) throw new NotFoundError('Return not found');

    this.validateTransition(ret.status, 'approved');

    const updated = await returnRepository.updateStatus(id, 'approved', {
      approvedAt: new Date(),
      adminNote: note,
    }, adminUserId);
    if (!updated) throw new NotFoundError('Return not found');
    return updated;
  }

  /**
   * Admin rejects the return request.
   */
  async reject(
    id: string,
    adminUserId: string,
    reason: string
  ): Promise<IReturn> {
    const ret = await returnRepository.findById(id);
    if (!ret) throw new NotFoundError('Return not found');

    this.validateTransition(ret.status, 'rejected');

    const updated = await returnRepository.updateStatus(id, 'rejected', {
      rejectedAt: new Date(),
      rejectionReason: reason,
    }, adminUserId);
    if (!updated) throw new NotFoundError('Return not found');
    return updated;
  }

  /**
   * Admin marks the return as received (item arrived at warehouse).
   * Does NOT restore stock yet — that happens at refund.
   * Can be called from 'approved' (in-person returns) or 'in_transit' (shipped returns).
   */
  async markReceived(
    id: string,
    adminUserId: string,
    note?: string
  ): Promise<IReturn> {
    const ret = await returnRepository.findById(id);
    if (!ret) throw new NotFoundError('Return not found');

    this.validateTransition(ret.status, 'received');

    const updated = await returnRepository.updateStatus(id, 'received', {
      receivedAt: new Date(),
      adminNote: note,
    }, adminUserId);
    if (!updated) throw new NotFoundError('Return not found');
    return updated;
  }

  /**
   * Customer marks return as in_transit (shipped back to warehouse).
   */
  async markInTransit(userId: string, returnId: string): Promise<IReturn> {
    const ret = await returnRepository.findById(returnId);
    if (!ret) throw new NotFoundError('Return not found');

    if (ret.userId?.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this return');
    }

    this.validateTransition(ret.status, 'in_transit');

    const updated = await returnRepository.update(returnId, {
      status: 'in_transit',
      $push: {
        timeline: {
          status: 'in_transit',
          at: new Date(),
          by: 'customer',
        },
      },
    } as any);
    if (!updated) throw new NotFoundError('Return not found');
    return updated;
  }

  /**
   * Admin processes the refund — restores stock atomically.
   */
  async refund(
    id: string,
    _adminUserId: string,
    input: {
      refundTransactionId?: string;
      refundMethod?: 'stripe' | 'razorpay' | 'manual';
      note?: string;
      restock?: boolean;
    }
  ): Promise<IReturn> {
    const ret = await returnRepository.findById(id);
    if (!ret) throw new NotFoundError('Return not found');

    this.validateTransition(ret.status, 'refunded');

    // Restock the items (unless admin explicitly chooses not to)
    if (input.restock !== false) {
      for (const item of ret.items) {
        if (item.restocked) continue;

        await Product.updateOne(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': item.quantity } }
        );

        item.restocked = true;
      }
    }

    const updated = await returnRepository.update(id, {
      status: 'refunded',
      refundStatus: 'completed',
      refundedAt: new Date(),
      refundTransactionId: input.refundTransactionId,
      refundMethod: input.refundMethod,
      items: ret.items,       // includes updated restocked flags
      adminNote: input.note,
      $push: {
        timeline: {
          status: 'refunded',
          at: new Date(),
          by: `admin:${_adminUserId}`,
          note: input.note,
        },
      },
    } as any);

    if (!updated) throw new NotFoundError('Return not found');

    logger.info(
      { returnId: id, amount: ret.refundAmount, restocked: input.restock !== false },
      'Return refunded'
    );

    return updated;
  }

  private validateTransition(
    current: ReturnStatus,
    next: ReturnStatus
  ): void {
    const allowed = VALID_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestError(
        `Cannot transition from "${current}" to "${next}"`
      );
    }
  }
}

export const returnService = new ReturnService();
