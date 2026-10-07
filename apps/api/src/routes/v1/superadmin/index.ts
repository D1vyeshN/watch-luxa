import { Router, type Router as RouterType } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/role.middleware';
import { requireActiveAccount } from '@middleware/activeAccount.middleware';
import { auditWrites } from '@middleware/audit.middleware';
import { validate } from '@middleware/validate.middleware';
import { superadminTeamController } from '@controllers/superadmin/team.controller';
import {
  createAdminSchema,
  updateAdminSchema,
  listAdminsSchema,
} from '@validators/team.validator';

const router: RouterType = Router();

// Every /superadmin/* route: authenticated superadmin with an active account
router.use(authenticate);
router.use(authorize('superadmin'));
router.use(requireActiveAccount);
router.use(auditWrites);

router.get('/admins', validate(listAdminsSchema), superadminTeamController.list);
router.post('/admins', validate(createAdminSchema), superadminTeamController.create);
router.patch('/admins/:id', validate(updateAdminSchema), superadminTeamController.update);

export default router;
