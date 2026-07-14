'use client';

import { getApiErrorMessage } from '@/lib/api';
import { EmptyState, ErrorState } from './states';
import { ListCardSkeleton, TableSkeleton } from './skeleton';
import { Pagination, type PaginationProps } from './pagination';

interface QueryListPanelProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeleton?: 'table' | 'list';
  skeletonRows?: number;
  skeletonColumns?: number;
  pagination?: PaginationProps;
  children: React.ReactNode;
}

export function QueryListPanel({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  skeleton = 'list',
  skeletonRows = 5,
  skeletonColumns = 5,
  pagination,
  children,
}: QueryListPanelProps) {
  if (isLoading) {
    return skeleton === 'table' ? (
      <TableSkeleton rows={skeletonRows} columns={skeletonColumns} />
    ) : (
      <ListCardSkeleton rows={skeletonRows} />
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className="space-y-4">
      {children}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
