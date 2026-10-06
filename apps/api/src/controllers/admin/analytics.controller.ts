import { Request, Response } from 'express';
import { analyticsService } from '@services/analytics.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getDateRange } from '@utils/dateRange';

export const adminAnalyticsController: any = {
  /**
   * GET /api/v1/admin/analytics/dashboard
   * Query: ?preset=30d | ?from=...&to=...
   */
  dashboard: asyncHandler(async (req: Request, res: Response) => {
    const range = getDateRange(req.query as Record<string, string>);
    const data = await analyticsService.getDashboard(range);
    return sendSuccess(res, data, 'Dashboard analytics');
  }),

  /**
   * GET /api/v1/admin/analytics/top-products
   */
  topProducts: asyncHandler(async (req: Request, res: Response) => {
    const range = getDateRange(req.query as Record<string, string>);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await analyticsService.getTopProducts(range, limit);
    return sendSuccess(res, data, 'Top products');
  }),

  /**
   * GET /api/v1/admin/analytics/top-customers
   */
  topCustomers: asyncHandler(async (req: Request, res: Response) => {
    const range = getDateRange(req.query as Record<string, string>);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await analyticsService.getTopCustomers(range, limit);
    return sendSuccess(res, data, 'Top customers');
  }),

  /**
   * GET /api/v1/admin/analytics/revenue-by-category
   */
  revenueByCategory: asyncHandler(async (req: Request, res: Response) => {
    const range = getDateRange(req.query as Record<string, string>);
    const data = await analyticsService.getRevenueByCategory(range);
    return sendSuccess(res, data, 'Revenue by category');
  }),

  /**
   * GET /api/v1/admin/analytics/low-stock
   */
  lowStock: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const data = await analyticsService.getLowStock(limit);
    return sendSuccess(res, data, 'Low stock variants');
  }),

  /**
   * GET /api/v1/admin/analytics/recent-orders
   */
  recentOrders: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await analyticsService.getRecentOrders(limit);
    return sendSuccess(res, data, 'Recent orders');
  }),

  /**
   * GET /api/v1/admin/analytics/inventory-value
   */
  inventoryValue: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getInventoryValue();
    return sendSuccess(res, data, 'Inventory value');
  }),
};
