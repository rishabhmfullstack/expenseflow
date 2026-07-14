'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { ReceiptPreview } from '@/components/claims/receipt-preview';
import { Button } from '@/components/ui/button';
import {
  formatFileSize,
  RECEIPT_ACCEPT,
  validateReceiptFile,
} from '@/lib/receipt-upload';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';

interface ReceiptUploadFieldProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ReceiptUploadField({
  value,
  onChange,
  disabled = false,
  className,
}: ReceiptUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isUploading = uploadProgress !== null;

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateReceiptFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploadProgress(0);
      setSelectedFileName(file.name);

      try {
        const uploaded = await uploadService.uploadReceipt(file, setUploadProgress);
        onChange(uploaded.path);
        setSelectedFileName(uploaded.originalName);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
        setSelectedFileName(null);
      } finally {
        setUploadProgress(null);
      }
    },
    [onChange],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.[0] || disabled || isUploading) {
        return;
      }

      void handleUpload(files[0]);
    },
    [disabled, handleUpload, isUploading],
  );

  const handleRemove = () => {
    onChange('');
    setSelectedFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (disabled && value) {
    return (
      <ReceiptPreview
        receiptPath={value}
        fileName={selectedFileName ?? undefined}
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="text-sm font-medium text-slate-700">Receipt</p>
        <p className="mt-1 text-xs text-slate-500">
          Optional. JPG, JPEG, PNG, or PDF up to 5 MB.
        </p>
      </div>

      {value ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <ReceiptPreview receiptPath={value} fileName={selectedFileName ?? undefined} />
          {!disabled && (
            <Button type="button" variant="secondary" onClick={handleRemove}>
              <X className="mr-2 h-4 w-4" />
              Remove receipt
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled && !isUploading) {
              setIsDragging(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            disabled || isUploading
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
              : isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={RECEIPT_ACCEPT}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(event) => handleFiles(event.target.files)}
          />

          <Upload className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Drag and drop your receipt here
          </p>
          <p className="mt-1 text-xs text-slate-500">or</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Uploading{selectedFileName ? `: ${selectedFileName}` : '...'}</span>
            <span>{uploadProgress ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-200"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!value && !isUploading && !error && (
        <p className="text-xs text-slate-400">Maximum file size: {formatFileSize(5 * 1024 * 1024)}</p>
      )}
    </div>
  );
}
