import { Router, type Router as RouterType } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/role.middleware';

import brandRoutes from './brand.routes';

const router: RouterType = Router();

// Every /admin/* route requires authentication + admin role
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.use('/brands', brandRoutes);

export default router;
