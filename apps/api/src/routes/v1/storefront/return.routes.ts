import { Router, type Router as RouterType } from 'express';
import { returnController } from '@controllers/return.controller';
import { optionalAuth } from '@middleware/optionalAuth.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import {
  createReturnSchema,
  trackReturnSchema,
  markInTransitSchema,
} from '@validators/return.validator';

const router: RouterType = Router();

// Public — submit (guest or auth) + track
router.post(
  '/',
  optionalAuth,
  validate(createReturnSchema),
  returnController.create
);

router.get(
  '/track/:returnNumber',
  validate(trackReturnSchema),
  returnController.track
);

// Authenticated
router.get('/me', authenticate, returnController.myReturns);
router.get('/me/:id', authenticate, returnController.myReturn);
router.patch('/me/:id/cancel', authenticate, returnController.cancelOwn);
router.patch(
  '/me/:id/shipped',
  authenticate,
  validate(markInTransitSchema),
  returnController.markInTransit
);

export default router;
