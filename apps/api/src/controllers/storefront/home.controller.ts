import { Request, Response } from 'express';
import { Category } from '@models/category.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { toStorefrontCategory } from '@utils/storefrontFilters';
import { cacheGet, cacheSet } from '@utils/cache';
import { homepageService } from '@services/homepage.service';
import { resolveHomeSections } from '@services/homeRails';

export const storefrontHomeController: Record<string, any> = {
  /**
   * GET /api/v1/home
   * Everything the homepage renders, in one call: the hero, the sections
   * below it (product rails already filled, in page order — see
   * services/homeRails.ts) and the categories the bento grid draws from.
   */
  index: asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'home:aggregate';
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Home data fetched');

    const [hero, sections, categories] = await Promise.all([
      homepageService.getStorefrontHero(),
      homepageService.getStorefrontSections().then(resolveHomeSections),
      Category.find({ status: 'active' }).sort({ displayOrder: 1 }).limit(20).lean(),
    ]);

    const result = {
      hero,
      sections,
      categories: categories.map(toStorefrontCategory),
    };

    await cacheSet(cacheKey, result, 300); // 5 minutes

    return sendSuccess(res, result, 'Home data fetched');
  }),
};
