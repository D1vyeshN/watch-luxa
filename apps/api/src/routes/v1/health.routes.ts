import { Router } from 'express';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

const router: Router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    return sendSuccess(res, {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }, 'Server is healthy');
  })
);

export default router;