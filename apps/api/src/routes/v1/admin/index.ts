import { Router, type Router as RouterType } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/role.middleware';

import brandRoutes from './brand.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import collectionRoutes from './collection.routes';
import uploadRoutes from './upload.routes';
import csvImportRoutes from './csvImport.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import returnRoutes from './return.routes';
import couponRoutes from './coupon.routes';
import analyticsRoutes from './analytics.routes';

const router: RouterType = Router();

// Every /admin/* route requires authentication + admin role
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);
router.use('/uploads', uploadRoutes);
router.use('/csv', csvImportRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/returns', returnRoutes);
router.use('/coupons', couponRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
