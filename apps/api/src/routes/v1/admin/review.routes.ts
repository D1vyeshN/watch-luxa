import { Router } from 'express';
import { adminReviewController } from '@controllers/admin/review.controller';
import { validate } from '@middleware/validate.middleware';
import {
  adminListReviewsSchema,
  rejectReviewSchema,
  replyReviewSchema,
} from '@validators/review.validator';

const router = Router();

router.get('/', validate(adminListReviewsSchema), adminReviewController.list);
router.patch('/:id/approve', adminReviewController.approve);
router.patch(
  '/:id/reject',
  validate(rejectReviewSchema),
  adminReviewController.reject
);
router.post(
  '/:id/reply',
  validate(replyReviewSchema),
  adminReviewController.reply
);
router.delete('/:id/reply', adminReviewController.removeReply);
router.delete('/:id', adminReviewController.delete);

export default router as any;
