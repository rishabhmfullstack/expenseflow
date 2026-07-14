'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, QueryListPanel } from '@/components/common';
import { ManagerActionHistoryRow } from '@/components/claims/manager-action-history-row';
import { ManagerHistoryFilters } from '@/components/filters/manager-history-filters';
import { managerService } from '@/services/manager.service';
import { usePaginatedFilters } from '@/hooks/use-paginated-filters';
import {
  defaultManagerHistoryFilter,
  type ManagerHistoryFilterValues,
} from '@/schemas/filter.schema';
import { isDefaultPageQuery } from '@/lib/react-query/initial-data';
import type { ClaimStatus, ManagerActionHistoryEntry, PaginationMeta } from '@/types';

const PAGE_SIZE = 10;

export function ManagerHistoryContent({
  initialData,
}: {
  initialData?: { history: ManagerActionHistoryEntry[]; meta: PaginationMeta } | null;
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
  } = usePaginatedFilters<ManagerHistoryFilterValues>({
    defaults: defaultManagerHistoryFilter,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['manager', 'history', { page, filters: queryFilters }],
    queryFn: () =>
      managerService.listHistory({
        page,
        limit: PAGE_SIZE,
        search: queryFilters.search || undefined,
        status: (queryFilters.status as ClaimStatus) || undefined,
        actionDateFrom: queryFilters.actionDateFrom || undefined,
        actionDateTo: queryFilters.actionDateTo || undefined,
      }),
    initialData:
      isDefaultPageQuery(page, queryFilters, defaultManagerHistoryFilter) && initialData
        ? initialData
        : undefined,
  });

  return (
    <DashboardShell allowedRoles={['MANAGER']}>
      <PageHeader
        title="Action History"
        description="Review claims you have approved, rejected, or sent back for revision"
      />

      <ManagerHistoryFilters
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
        isEmpty={!data?.history.length}
        emptyTitle="No actions found"
        emptyDescription="Your approval actions will appear here once you review claims."
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
          {data?.history.map((entry) => (
            <ManagerActionHistoryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </QueryListPanel>
    </DashboardShell>
  );
}
