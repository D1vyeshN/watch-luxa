import multer from 'multer';
import { RequestHandler } from 'express';
import { BadRequestError } from '@utils/AppError';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // max 10 files per request
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF`
        )
      );
    }
  },
});

// Named middlewares for common patterns
export const uploadSingle: RequestHandler = upload.single('file');
export const uploadMultiple: RequestHandler = upload.array('files', 10);
export const uploadGallery: RequestHandler = upload.array('images', 10);

// Multer error handler (add to global error middleware)
export const handleMulterError = (err: any): never => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw new BadRequestError('File too large (max 10 MB)');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      throw new BadRequestError('Too many files (max 10)');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new BadRequestError(`Unexpected field: ${err.field}`);
    }
  }
  throw err;
};
