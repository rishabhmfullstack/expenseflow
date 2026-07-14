'use client';

import { Download, FileText } from 'lucide-react';
import {
  getReceiptPublicUrl,
  isImageReceipt,
  isPdfReceipt,
} from '@/lib/receipt-upload';
import { cn } from '@/lib/utils';

interface ReceiptPreviewProps {
  receiptPath: string;
  fileName?: string;
  className?: string;
}

export function ReceiptPreview({ receiptPath, fileName, className }: ReceiptPreviewProps) {
  const publicUrl = getReceiptPublicUrl(receiptPath);

  if (!publicUrl) {
    return null;
  }

  const displayName = fileName ?? receiptPath.split('/').pop() ?? 'receipt';

  if (isImageReceipt(receiptPath)) {
    return (
      <div className={cn('space-y-3', className)}>
        <p className="text-sm font-medium text-slate-700">Receipt preview</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicUrl}
            alt={`Receipt ${displayName}`}
            className="max-h-80 w-full object-contain"
          />
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Download className="h-4 w-4" />
          Open full image
        </a>
      </div>
    );
  }

  if (isPdfReceipt(receiptPath)) {
    return (
      <div className={cn('space-y-3', className)}>
        <p className="text-sm font-medium text-slate-700">Receipt file</p>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-900">{displayName}</p>
            <p className="text-sm text-slate-500">PDF document</p>
          </div>
          <a
            href={publicUrl}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    );
  }

  return null;
}
