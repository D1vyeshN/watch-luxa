import { Request, Response } from 'express';
import { checkoutService } from '@services/checkout.service';
import { orderService } from '@services/order.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

const getOwner = (req: Request) => ({
  userId: req.user?.userId,
  sessionId: req.sessionId,
});

export const checkoutController: any = {
  /**
   * GET /api/v1/checkout/summary
   * Preview totals for the checkout page.
   */
  summary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await checkoutService.getCheckoutSummary(getOwner(req));
    return sendSuccess(res, summary, 'Checkout summary');
  }),

  /**
   * POST /api/v1/checkout
   * Create order from cart.
   */
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const order = await checkoutService.createOrder({
      owner: getOwner(req),
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress,
      customerNote: req.body.customerNote,
    });

    return sendSuccess(
      res,
      {
        orderNumber: order.orderNumber,
        orderId: order._id,
        total: order.total,
        currency: order.currency,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
      'Order created',
      201
    );
  }),

  /**
   * GET /api/v1/orders/track/:orderNumber
   * Public order tracking.
   */
  trackOrder: asyncHandler(async (req: Request, res: Response) => {
    const { orderNumber } = req.params;
    const email = req.query.email as string | undefined;

    const order = await orderService.trackByNumber(orderNumber as string, email);
    return sendSuccess(res, order, 'Order found');
  }),
};
