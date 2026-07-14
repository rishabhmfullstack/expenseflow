import { RequestHandler } from 'express';
import { toReceiptPublicPath } from '../config/uploads';

export class UploadController {
  uploadReceipt: RequestHandler = async (req, res) => {
    const file = req.file!;

    res.status(201).json({
      success: true,
      data: {
        path: toReceiptPublicPath(file.filename),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  };
}

export const uploadController = new UploadController();
