import { Router, type Router as RouterType } from 'express';
import { adminSettingsController } from '@controllers/admin/settings.controller';
import { authorize } from '@middleware/role.middleware';
import { validate } from '@middleware/validate.middleware';
import { updateSettingsSchema } from '@validators/settings.validator';

const router: RouterType = Router();

// Any admin can read; only superadmins change tax / shipping / returns
router.get('/', adminSettingsController.get);
router.put('/', authorize('superadmin'), validate(updateSettingsSchema), adminSettingsController.update);

export default router;
