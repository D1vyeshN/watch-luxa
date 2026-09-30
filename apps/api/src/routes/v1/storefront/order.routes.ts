import { Router, type Router as RouterType } from 'express';
import { orderController } from '@controllers/order.controller';
import { authenticate } from '@middleware/auth.middleware';
import { optionalAuth } from '@middleware/optionalAuth.middleware';

const router: RouterType = Router();

router.use(authenticate);

router.get('/me', orderController.myOrders);
router.get('/me/:orderNumber', orderController.myOrder);

// Public endpoint for polling order status (used during checkout)
router.get('/:orderId/status', optionalAuth, orderController.getOrderStatus);

export default router;
