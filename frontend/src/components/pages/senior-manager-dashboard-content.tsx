'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/common/states';
import { ClaimRow, Pagination } from '@/components/claims/claim-row';
import { seniorManagerService } from '@/services/senior-manager.service';
import { getApiErrorMessage } from '@/lib/axios';

export function SeniorManagerDashboardContent({
  initialData,
}: {
  initialData?: {
    claims: import('@/types').ClaimWithEmployee[];
    meta: import('@/types').PaginationMeta;
  } | null;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['senior-manager', 'claims', page],
    queryFn: () => seniorManagerService.listPending({ page, limit: 10 }),
    initialData: page === 1 ? (initialData ?? undefined) : undefined,
  });

  return (
    <DashboardShell allowedRoles={['SENIOR_MANAGER']}>
      <PageHeader
        title="Senior Manager Dashboard"
        description="Review claims pending your approval"
      />
      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />}
      {!isLoading && !isError && data?.claims.length === 0 && (
        <EmptyState title="No pending claims" description="All caught up!" />
      )}
      {!isLoading && !isError && data && data.claims.length > 0 && (
        <>
          <div className="space-y-3">
            {data.claims.map((claim) => (
              <ClaimRow
                key={claim.id}
                claim={claim}
                href={`/senior-manager/claims/${claim.id}`}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </DashboardShell>
  );
}
