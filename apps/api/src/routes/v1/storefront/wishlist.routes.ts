import { Router } from 'express';
import { wishlistController } from '@controllers/wishlist.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { wishlistProductSchema } from '@validators/wishlist.validator';

const router: Router = Router();

// Wishlist requires auth
router.use(authenticate);

router.get('/', wishlistController.get);
router.post('/', validate(wishlistProductSchema), wishlistController.add);
router.post('/toggle', validate(wishlistProductSchema), wishlistController.toggle);
router.get('/check/:productId', wishlistController.check);
router.delete('/:productId', wishlistController.remove);
router.delete('/', wishlistController.clear);

export default router;
