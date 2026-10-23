import { Router, type Router as RouterType } from 'express';
import { adminNewsletterController } from '@controllers/admin/newsletter.controller';
import { validate } from '@middleware/validate.middleware';
import {
  exportSubscribersSchema,
  listSubscribersSchema,
  updateSubscriberSchema,
} from '@validators/newsletter.validator';

const router: RouterType = Router();

// Any admin, like customers (the parent router already requires admin)
router.get('/', validate(listSubscribersSchema), adminNewsletterController.list);
router.get('/export', validate(exportSubscribersSchema), adminNewsletterController.exportCsv);
router.patch('/:id', validate(updateSubscriberSchema), adminNewsletterController.update);

export default router;
