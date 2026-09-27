import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { adminCsvImportController } from '@controllers/admin/csvImport.controller';
import { BadRequestError } from '@utils/AppError';

const router: RouterType = Router();

// CSV-specific multer — memory storage, single file, max 10 MB
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only CSV files are allowed'));
    }
  },
}).single('file');

router.get('/template', adminCsvImportController.downloadTemplate);
router.post('/preview', csvUpload, adminCsvImportController.preview);
router.post('/import', csvUpload, adminCsvImportController.import);

export default router;
