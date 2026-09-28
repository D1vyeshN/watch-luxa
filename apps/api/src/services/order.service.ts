import { orderRepository, FindManyOptions } from '@repositories/order.repository';
import { IOrder, OrderStatus } from '@models/order.model';
import { NotFoundError, BadRequestError } from '@utils/AppError';

type FilterQuery = any;

// Valid status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export class OrderService {
  async findMany(filter: FilterQuery, options: FindManyOptions) {
    return orderRepository.findMany(filter, options);
  }

  async findById(id: string): Promise<IOrder> {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder> {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  /**
   * Public order tracking — returns limited fields, no PII beyond what customer already knows.
   */
  async trackByNumber(
    orderNumber: string,
    email?: string
  ): Promise<Partial<IOrder>> {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order not found');

    // Optional email verification for security
    if (email) {
      const orderEmail =
        order.guestEmail || order.shippingAddress.email;
      if (orderEmail.toLowerCase() !== email.toLowerCase()) {
        throw new NotFoundError('Order not found');
      }
    }

    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      items: order.items,
      total: order.total,
      currency: order.currency,
      shippingAddress: {
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        country: order.shippingAddress.country,
      } as any,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      timeline: order.timeline,
    };
  }

  /**
   * Get orders for a specific user.
   */
  async getMyOrders(
    userId: string,
    options: FindManyOptions
  ): Promise<{ data: IOrder[]; total: number }> {
    return orderRepository.findByUserId(userId, options);
  }

  /**
   * Admin: update order status with transition validation.
   */
  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    additional?: {
      trackingNumber?: string;
      carrier?: string;
      note?: string;
    }
  ): Promise<IOrder> {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found');

    const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestError(
        `Cannot transition from "${order.orderStatus}" to "${newStatus}"`
      );
    }

    const updates: Partial<IOrder> = {};

    if (newStatus === 'shipped') {
      updates.shippedAt = new Date();
      if (additional?.trackingNumber) {
        updates.trackingNumber = additional.trackingNumber;
      }
      if (additional?.carrier) {
        updates.carrier = additional.carrier;
      }
    }

    if (newStatus === 'delivered') {
      updates.deliveredAt = new Date();
    }

    if (newStatus === 'cancelled') {
      updates.cancelledAt = new Date();
    }

    if (newStatus === 'refunded') {
      updates.refundedAt = new Date();
      updates.paymentStatus = 'refunded';
    }

    if (newStatus === 'paid') {
      updates.paidAt = new Date();
      updates.paymentStatus = 'paid';
    }

    const updated = await orderRepository.updateStatus(id, newStatus, updates);
    if (!updated) throw new NotFoundError('Order not found');

    return updated;
  }

  /**
   * Update tracking info without changing status.
   */
  async updateTracking(
    id: string,
    trackingNumber: string,
    carrier?: string
  ): Promise<IOrder> {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found');

    const updated = await orderRepository.update(id, {
      trackingNumber,
      carrier,
    });

    if (!updated) throw new NotFoundError('Order not found');
    return updated;
  }
}

export const orderService = new OrderService();
