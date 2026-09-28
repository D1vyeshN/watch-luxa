import { Router } from 'express';
import { cartController } from '@controllers/cart.controller';
import { optionalAuth, requireCartOwner } from '@middleware/optionalAuth.middleware';
import { validate } from '@middleware/validate.middleware';
import {
  addCartItemSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '@validators/cart.validator';

const router: Router = Router();

// All cart routes accept either auth or session ID
router.use(optionalAuth);
router.use(requireCartOwner);

router.get('/', cartController.get);
router.post('/items', validate(addCartItemSchema), cartController.addItem);
router.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  cartController.updateItem
);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clear);

// Merge uses auth + sessionId together — no requireCartOwner here
router.post('/merge', optionalAuth, validate(mergeCartSchema), cartController.merge);

export default router;
