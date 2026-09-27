import { Request, Response, RequestHandler } from 'express';
import { csvImportService } from '@services/csvImport.service';
import { generateCsvTemplate } from '@utils/csvParser';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { BadRequestError } from '@utils/AppError';

export const adminCsvImportController: Record<string, RequestHandler> = {
  /**
   * GET /api/v1/admin/csv/template
   * Download a CSV template with headers and one example row.
   */
  downloadTemplate: asyncHandler(async (_req: Request, res: Response) => {
    const csv = generateCsvTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="luxe-timepieces-products-template.csv"'
    );

    return res.status(200).send(csv);
  }),

  /**
   * POST /api/v1/admin/csv/preview
   * Validate a CSV without importing. Returns a summary + errors.
   */
  preview: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('CSV file is required');
    }

    const preview = await csvImportService.preview(req.file.buffer);
    return sendSuccess(res, preview, 'Preview generated');
  }),

  /**
   * POST /api/v1/admin/csv/import
   * Validate and import a CSV. All-or-nothing transaction.
   */
  import: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('CSV file is required');
    }

    const result = await csvImportService.import(req.file.buffer);

    return sendSuccess(
      res,
      result,
      `Import successful: ${result.imported} products, ${result.importedVariants} variants`,
      201
    );
  }),
};
