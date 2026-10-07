import { Request, Response } from 'express';
import { settingsService } from '@services/settings.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

export const adminSettingsController: any = {
  /**
   * GET /api/v1/admin/settings
   */
  get: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.get();
    return sendSuccess(res, settings, 'Settings fetched');
  }),

  /**
   * PUT /api/v1/admin/settings — superadmin only (checkout reads these)
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { before, after } = await settingsService.update(req.body);
    res.locals.audit = { before, after }; // see middleware/audit.middleware.ts
    return sendSuccess(res, after, 'Settings updated');
  }),
};
