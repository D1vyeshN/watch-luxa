import { Router, type Router as RouterType } from 'express';
import { adminAuditLogController } from '@controllers/admin/auditLog.controller';
import { authorize } from '@middleware/role.middleware';
import { validate } from '@middleware/validate.middleware';
import { listAuditLogsSchema } from '@validators/settings.validator';

const router: RouterType = Router();

router.use(authorize('superadmin'));
router.get('/', validate(listAuditLogsSchema), adminAuditLogController.list);

export default router;
