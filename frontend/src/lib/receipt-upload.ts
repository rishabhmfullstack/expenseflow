import { API_BASE_URL } from '@/lib/api/constants';

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export const RECEIPT_ACCEPT =
  'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf';

export const RECEIPT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const RECEIPT_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'] as const;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function validateReceiptFile(file: File): string | null {
  const extension = getFileExtension(file.name);

  if (
    !RECEIPT_ALLOWED_EXTENSIONS.includes(
      extension as (typeof RECEIPT_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return 'Only JPG, JPEG, PNG, and PDF files are allowed';
  }

  if (
    !RECEIPT_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof RECEIPT_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'Unsupported file type';
  }

  if (file.size > RECEIPT_MAX_BYTES) {
    return 'File must be 5 MB or smaller';
  }

  return null;
}

export function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index === -1 ? '' : filename.slice(index).toLowerCase();
}

export function getReceiptPublicUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isPdfReceipt(path: string | null | undefined): boolean {
  return !!path && /\.pdf($|\?)/i.test(path);
}

export function isImageReceipt(path: string | null | undefined): boolean {
  return !!path && /\.(jpg|jpeg|png)($|\?)/i.test(path);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
