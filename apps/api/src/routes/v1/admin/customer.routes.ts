import { Router, type Router as RouterType } from 'express';
import { adminCustomerController } from '@controllers/admin/customer.controller';

const router: RouterType = Router();

router.get('/', adminCustomerController.list);
router.get('/:id', adminCustomerController.getById);

export default router;
