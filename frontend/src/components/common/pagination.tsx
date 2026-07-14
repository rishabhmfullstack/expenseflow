'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  className?: string;
  isLoading?: boolean;
}

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  total,
  limit = 10,
  onPageChange,
  className,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1 && !total) {
    return null;
  }

  const start = total ? (page - 1) * limit + 1 : undefined;
  const end = total ? Math.min(page * limit, total) : undefined;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {total !== undefined && start !== undefined && end !== undefined ? (
        <p className="text-sm text-slate-500">
          Showing {start}–{end} of {total}
        </p>
      ) : (
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            {visiblePages.map((pageNumber, index) => {
              const previous = visiblePages[index - 1];
              const showEllipsis = previous !== undefined && pageNumber - previous > 1;

              return (
                <span key={pageNumber} className="flex items-center gap-1">
                  {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => onPageChange(pageNumber)}
                    className={cn(
                      'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                      pageNumber === page
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50',
                    )}
                    aria-current={pageNumber === page ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                </span>
              );
            })}
          </div>

          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
