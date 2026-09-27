import { Request, Response, RequestHandler } from 'express';
import { storageService, UploadFolder } from '@services/storage.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { BadRequestError } from '@utils/AppError';

const VALID_FOLDERS: UploadFolder[] = [
  'brands',
  'categories',
  'collections',
  'products',
  'variants',
  'avatars',
];

export const adminUploadController: Record<string, RequestHandler> = {
  /**
   * POST /api/v1/admin/uploads/single
   * Upload a single image.
   *
   * Form-data:
   *   file: File (required)
   *   folder: string (required) — brands | categories | collections | products | variants
   *   nameHint: string (optional) — used for filename slug
   */
  single: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const folder = req.body.folder as UploadFolder;
    if (!folder || !VALID_FOLDERS.includes(folder)) {
      throw new BadRequestError(
        `Invalid folder. Allowed: ${VALID_FOLDERS.join(', ')}`
      );
    }

    const result = await storageService.uploadImage(
      req.file,
      folder,
      req.body.nameHint
    );

    return sendSuccess(res, result, 'Image uploaded', 201);
  }),

  /**
   * POST /api/v1/admin/uploads/multiple
   * Upload multiple images at once.
   *
   * Form-data:
   *   files: File[] (required, max 10)
   *   folder: string (required)
   *   nameHint: string (optional)
   */
  multiple: asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const folder = req.body.folder as UploadFolder;
    if (!folder || !VALID_FOLDERS.includes(folder)) {
      throw new BadRequestError(
        `Invalid folder. Allowed: ${VALID_FOLDERS.join(', ')}`
      );
    }

    const results = await storageService.uploadImages(
      req.files,
      folder,
      req.body.nameHint
    );

    return sendSuccess(
      res,
      { uploaded: results.length, files: results },
      `${results.length} images uploaded`,
      201
    );
  }),

  /**
   * DELETE /api/v1/admin/uploads
   * Delete one or more images by their public URLs.
   *
   * Body:
   *   urls: string[] (required)
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new BadRequestError('urls must be a non-empty array');
    }

    // Convert URLs to storage paths
    const paths = urls
      .map((url) => storageService.extractPathFromUrl(url))
      .filter((p): p is string => p !== null);

    if (paths.length === 0) {
      throw new BadRequestError('No valid storage URLs provided');
    }

    await storageService.deleteImages(paths);

    return sendSuccess(
      res,
      { deleted: paths.length, paths },
      `${paths.length} images deleted`
    );
  }),
};
