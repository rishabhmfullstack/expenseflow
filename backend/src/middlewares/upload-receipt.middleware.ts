import crypto from 'crypto';
import path from 'path';
import multer, { MulterError } from 'multer';
import { Request, RequestHandler } from 'express';
import {
  isAllowedReceiptExtension,
  RECEIPT_ALLOWED_MIME_TYPES,
  RECEIPT_MAX_BYTES,
  RECEIPT_UPLOAD_DIR,
} from '../config/uploads';
import { ApiError } from '../utils';

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, RECEIPT_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  const extensionAllowed = isAllowedReceiptExtension(file.originalname);
  const mimeAllowed = RECEIPT_ALLOWED_MIME_TYPES.includes(
    file.mimetype as (typeof RECEIPT_ALLOWED_MIME_TYPES)[number],
  );

  if (!extensionAllowed || !mimeAllowed) {
    callback(
      ApiError.badRequest('Only JPG, JPEG, PNG, and PDF files up to 5 MB are allowed'),
    );
    return;
  }

  callback(null, true);
}

export const receiptUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: RECEIPT_MAX_BYTES,
    files: 1,
  },
});

export const uploadReceiptMiddleware: RequestHandler = (req, res, next) => {
  receiptUpload.single('receipt')(req, res, (error) => {
    if (!error) {
      if (!req.file) {
        next(ApiError.badRequest('Receipt file is required'));
        return;
      }

      next();
      return;
    }

    if (error instanceof MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(ApiError.badRequest('Receipt file must be 5 MB or smaller'));
        return;
      }

      next(ApiError.badRequest(error.message));
      return;
    }

    next(error);
  });
};
