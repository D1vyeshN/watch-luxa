import { Router, type Router as RouterType } from 'express';
import { orderController } from '@controllers/order.controller';
import { authenticate } from '@middleware/auth.middleware';

const router: RouterType = Router();

router.use(authenticate);

router.get('/me', orderController.myOrders);
router.get('/me/:orderNumber', orderController.myOrder);

export default router;
