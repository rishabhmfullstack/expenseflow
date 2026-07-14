import fs from 'fs';
import path from 'path';

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export const RECEIPT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const RECEIPT_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'] as const;

export const RECEIPT_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/receipts');

export const RECEIPT_PUBLIC_PREFIX = '/uploads/receipts';

export function ensureReceiptUploadDir(): void {
  fs.mkdirSync(RECEIPT_UPLOAD_DIR, { recursive: true });
}

export function isAllowedReceiptExtension(filename: string): boolean {
  const extension = path.extname(filename).toLowerCase();
  return RECEIPT_ALLOWED_EXTENSIONS.includes(
    extension as (typeof RECEIPT_ALLOWED_EXTENSIONS)[number],
  );
}

export function toReceiptPublicPath(filename: string): string {
  return `${RECEIPT_PUBLIC_PREFIX}/${filename}`;
}
