'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, QueryListPanel } from '@/components/common';
import { ClaimRow } from '@/components/claims/claim-row';
import { PendingClaimsFilters } from '@/components/filters/pending-claims-filters';
import { managerService } from '@/services/manager.service';
import { usePaginatedFilters } from '@/hooks/use-paginated-filters';
import {
  defaultPendingClaimsFilter,
  type PendingClaimsFilterValues,
} from '@/schemas/filter.schema';
import { isDefaultPageQuery } from '@/lib/react-query/initial-data';
import type { ClaimWithEmployee, ExpenseCategory, PaginationMeta } from '@/types';

const PAGE_SIZE = 10;

export function ManagerClaimsContent({
  initialData,
}: {
  initialData?: {
    claims: import('@/types').ClaimWithEmployee[];
    meta: import('@/types').PaginationMeta;
  } | null;
}) {
  const {
    page,
    setPage,
    filters,
    queryFilters,
    applyFilters,
    resetFilters,
    updateSearch,
    isSearchPending,
  } = usePaginatedFilters<PendingClaimsFilterValues>({
    defaults: defaultPendingClaimsFilter,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['manager', 'claims', { page, filters: queryFilters }],
    queryFn: () =>
      managerService.listPending({
        page,
        limit: PAGE_SIZE,
        search: queryFilters.search || undefined,
        category: (queryFilters.category as ExpenseCategory) || undefined,
        expenseDateFrom: queryFilters.expenseDateFrom || undefined,
        expenseDateTo: queryFilters.expenseDateTo || undefined,
      }),
    initialData:
      isDefaultPageQuery(page, queryFilters, defaultPendingClaimsFilter) && initialData
        ? initialData
        : undefined,
  });

  return (
    <DashboardShell allowedRoles={['MANAGER']}>
      <PageHeader title="Pending Claims" description="Claims awaiting your action" />

      <PendingClaimsFilters
        values={filters}
        onApply={applyFilters}
        onSearchChange={updateSearch}
        onReset={resetFilters}
        isSearchPending={isSearchPending || isFetching}
      />

      <QueryListPanel
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.claims.length}
        emptyTitle="No pending claims"
        emptyDescription="No claims match your filters or are pending with you."
        skeleton="list"
        pagination={
          data
            ? {
                page,
                totalPages: data.meta.totalPages,
                total: data.meta.total,
                limit: PAGE_SIZE,
                onPageChange: setPage,
                isLoading: isFetching,
              }
            : undefined
        }
      >
        <div className="space-y-3">
          {data?.claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} href={`/manager/claims/${claim.id}`} />
          ))}
        </div>
      </QueryListPanel>
    </DashboardShell>
  );
}
