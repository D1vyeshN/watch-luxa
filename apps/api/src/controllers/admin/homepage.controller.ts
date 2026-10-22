import { Request, Response } from 'express';
import { homepageService, sectionsOf } from '@services/homepage.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

export const adminHomepageController: any = {
  /**
   * GET /api/v1/admin/homepage
   */
  get: asyncHandler(async (_req: Request, res: Response) => {
    const homepage = await homepageService.get();
    // Sections fall back to the defaults so the editor always has a starting point
    return sendSuccess(res, { ...homepage, sections: sectionsOf(homepage) }, 'Homepage fetched');
  }),

  /**
   * PUT /api/v1/admin/homepage/hero — replaces the whole hero config
   */
  updateHero: asyncHandler(async (req: Request, res: Response) => {
    const { before, after } = await homepageService.updateHero(req.body);
    res.locals.audit = { before: before.hero, after: after.hero }; // see middleware/audit.middleware.ts
    return sendSuccess(res, after, 'Hero updated');
  }),

  /**
   * PUT /api/v1/admin/homepage/sections — replaces the whole section list
   */
  updateSections: asyncHandler(async (req: Request, res: Response) => {
    const { before, after } = await homepageService.updateSections(req.body.sections);
    res.locals.audit = { before, after };
    return sendSuccess(res, { sections: after }, 'Homepage sections updated');
  }),
};
