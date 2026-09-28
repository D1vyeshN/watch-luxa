import { Request, Response } from 'express';
import { orderService } from '@services/order.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';

export const adminOrderController: any = {
  /**
   * GET /api/v1/admin/orders
   * List orders with filters.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);

    const filter: any = {};

    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    // Date range
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from)
        (filter.createdAt as any).$gte = new Date(String(req.query.from as string));
      if (req.query.to)
        (filter.createdAt as any).$lte = new Date(String(req.query.to as string));
    }

    // Search by order number or email
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: String(req.query.search), $options: 'i' } },
        { guestEmail: { $regex: String(req.query.search), $options: 'i' } },
        {
          'shippingAddress.email': {
            $regex: String(req.query.search),
            $options: 'i',
          },
        },
      ];
    }

    const { data, total } = await orderService.findMany(filter, {
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });

    // Admin view — include internal fields
    const adminData = data.map((o) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress.fullName,
      customerEmail: o.guestEmail || o.shippingAddress.email,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      itemCount: o.items.length,
      total: o.total,
      currency: o.currency,
      city: o.shippingAddress.city,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    return sendPaginated(res, adminData, total, page, limit);
  }),

  /**
   * GET /api/v1/admin/orders/:id
   * Full order detail.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.findById(req.params.id as string);
    return sendSuccess(res, order, 'Order fetched');
  }),

  /**
   * PATCH /api/v1/admin/orders/:id/status
   * Update order status with transition validation.
   */
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateStatus(
      req.params.id as string,
      req.body.status,
      {
        trackingNumber: req.body.trackingNumber,
        carrier: req.body.carrier,
        note: req.body.note,
      }
    );

    return sendSuccess(res, order, `Order marked as ${req.body.status}`);
  }),

  /**
   * PATCH /api/v1/admin/orders/:id/tracking
   * Update tracking info without changing status.
   */
  updateTracking: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateTracking(
      req.params.id as string,
      req.body.trackingNumber,
      req.body.carrier
    );

    return sendSuccess(res, order, 'Tracking updated');
  }),
};
