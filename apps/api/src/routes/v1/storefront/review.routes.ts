import { Router } from 'express';
import { reviewController } from '@controllers/review.controller';
import { authenticate } from '@middleware/auth.middleware';
import { optionalAuth } from '@middleware/optionalAuth.middleware';
import { validate } from '@middleware/validate.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsSchema,
} from '@validators/review.validator';

// Note: this router is mounted at /api/v1/reviews (not nested under products)
// because product review listing is handled separately.
const router = Router();

// Public — list reviews and summary for a product
router.get(
  '/product/:productId',
  validate(listReviewsSchema),
  reviewController.listForProduct
);
router.get('/product/:productId/summary', reviewController.summary);

// Authenticated
router.get('/me', authenticate, reviewController.myReviews);
router.get(
  '/me/product/:productId',
  authenticate,
  reviewController.myReviewForProduct
);

router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  reviewController.create
);

router.put(
  '/:id',
  authenticate,
  validate(updateReviewSchema),
  reviewController.update
);

router.delete('/:id', authenticate, reviewController.delete);

router.post('/:id/helpful', authenticate, reviewController.helpful);
router.post('/:id/report', optionalAuth, reviewController.report);

export default router as any;
