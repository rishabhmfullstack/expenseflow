'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/common/states';
import { ClaimRow, Pagination } from '@/components/claims/claim-row';
import { managerService } from '@/services/manager.service';
import { getApiErrorMessage } from '@/lib/axios';

export function ManagerDashboardContent({
  initialData,
}: {
  initialData?: {
    claims: import('@/types').ClaimWithEmployee[];
    meta: import('@/types').PaginationMeta;
  } | null;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['manager', 'claims', page],
    queryFn: () => managerService.listPending({ page, limit: 10 }),
    initialData: page === 1 ? (initialData ?? undefined) : undefined,
  });

  return (
    <DashboardShell allowedRoles={['MANAGER']}>
      <PageHeader
        title="Manager Dashboard"
        description="Review claims pending your approval"
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />}
      {!isLoading && !isError && data?.claims.length === 0 && (
        <EmptyState title="No pending claims" description="All caught up! No claims need your review." />
      )}
      {!isLoading && !isError && data && data.claims.length > 0 && (
        <>
          <div className="space-y-3">
            {data.claims.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} href={`/manager/claims/${claim.id}`} />
            ))}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </DashboardShell>
  );
}
