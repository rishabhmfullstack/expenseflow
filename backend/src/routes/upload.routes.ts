import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate, uploadReceiptMiddleware } from '../middlewares';
import { asyncHandler } from '../utils';

const router = Router();

router.post(
  '/receipt',
  authenticate,
  uploadReceiptMiddleware,
  asyncHandler(uploadController.uploadReceipt),
);

export default router;
