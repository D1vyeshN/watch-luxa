import { Request, Response } from 'express';
import { settingsService } from '@services/settings.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';

export const storefrontSettingsController: any = {
  /**
   * GET /api/v1/settings
   * Public, customer-facing subset of the store settings — the storefront
   * shows shipping / tax estimates and policy text from these, so they match
   * what checkout charges (checkout reads the same settings server-side).
   */
  get: asyncHandler(async (_req: Request, res: Response) => {
    const s = await settingsService.get();
    res.setHeader('Cache-Control', 'public, max-age=60');
    return sendSuccess(
      res,
      {
        storeName: s.storeName,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        freeShippingThreshold: s.freeShippingThreshold,
        flatShippingFee: s.flatShippingFee,
        taxRate: s.taxRate,
        returnWindowDays: s.returnWindowDays,
        returnsPolicyText: s.returnsPolicyText ?? '',
      },
      'Settings fetched'
    );
  }),
};
