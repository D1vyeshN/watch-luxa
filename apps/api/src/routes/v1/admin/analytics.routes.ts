import { Router } from 'express';
import { adminAnalyticsController } from '@controllers/admin/analytics.controller';
import { validate } from '@middleware/validate.middleware';
import { analyticsQuerySchema } from '@validators/analytics.validator';

const router: any = Router();

router.get(
  '/dashboard',
  validate(analyticsQuerySchema),
  adminAnalyticsController.dashboard
);

router.get(
  '/top-products',
  validate(analyticsQuerySchema),
  adminAnalyticsController.topProducts
);

router.get(
  '/top-customers',
  validate(analyticsQuerySchema),
  adminAnalyticsController.topCustomers
);

router.get(
  '/revenue-by-category',
  validate(analyticsQuerySchema),
  adminAnalyticsController.revenueByCategory
);

router.get('/low-stock', adminAnalyticsController.lowStock);
router.get('/recent-orders', adminAnalyticsController.recentOrders);
router.get('/inventory-value', adminAnalyticsController.inventoryValue);

export default router;
