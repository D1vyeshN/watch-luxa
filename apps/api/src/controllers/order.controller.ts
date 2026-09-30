import { Request, Response } from 'express';
import { orderService } from '@services/order.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { UnauthorizedError } from '@utils/AppError';

export const orderController: any = {
  /**
   * GET /api/v1/orders/me
   * Get authenticated user's orders.
   */
  myOrders: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const { page, limit, skip } = getPagination(req.query);
    const { data, total } = await orderService.getMyOrders(
      req.user.userId,
      { skip, limit, sort: { createdAt: -1 } }
    );

    // Trim to customer-friendly fields
    const trimmed = data.map((o) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      total: o.total,
      currency: o.currency,
      itemCount: o.items.length,
      items: o.items.slice(0, 3), // preview of first 3
      createdAt: o.createdAt,
    }));

    return sendPaginated(res, trimmed, total, page, limit);
  }),

  /**
   * GET /api/v1/orders/me/:orderNumber
   * Get one of the user's orders in detail.
   */
  myOrder: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const order = await orderService.findByOrderNumber(req.params.orderNumber as string);

    // Ownership check
    if (order.userId?.toString() !== req.user.userId) {
      throw new UnauthorizedError('You do not have access to this order');
    }

    return sendSuccess(res, order, 'Order fetched');
  }),

  /**
   * GET /api/v1/orders/:orderId/status
   * Public endpoint for polling order status during checkout.
   * Used by frontend to wait for webhook confirmation.
   */
  getOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const { Order } = await import('@models/order.model');
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return sendSuccess(res, { paymentStatus: 'not_found', orderStatus: 'not_found' }, 'Order not found');
    }

    return sendSuccess(
      res,
      {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
      'Order status'
    );
  }),
};
