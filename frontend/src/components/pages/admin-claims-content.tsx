'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, QueryListPanel } from '@/components/common';
import { ClaimRow } from '@/components/claims/claim-row';
import { AdminClaimsFilters } from '@/components/filters/admin-claims-filters';
import { adminService } from '@/services/admin.service';
import { usePaginatedFilters } from '@/hooks/use-paginated-filters';
import {
  defaultAdminClaimsFilter,
  type AdminClaimsFilterValues,
} from '@/schemas/filter.schema';
import { isDefaultPageQuery } from '@/lib/react-query/initial-data';
import type { ClaimStatus, ClaimWithEmployee, ExpenseCategory, PaginationMeta } from '@/types';

const PAGE_SIZE = 10;

export function AdminClaimsContent({
  initialData,
}: {
  initialData?: { claims: ClaimWithEmployee[]; meta: PaginationMeta } | null;
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
  } = usePaginatedFilters<AdminClaimsFilterValues>({
    defaults: defaultAdminClaimsFilter,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'claims', { page, filters: queryFilters }],
    queryFn: () =>
      adminService.listClaims({
        page,
        limit: PAGE_SIZE,
        search: queryFilters.search || undefined,
        status: (queryFilters.status as ClaimStatus) || undefined,
        category: (queryFilters.category as ExpenseCategory) || undefined,
        expenseDateFrom: queryFilters.expenseDateFrom || undefined,
        expenseDateTo: queryFilters.expenseDateTo || undefined,
      }),
    initialData:
      isDefaultPageQuery(page, queryFilters, defaultAdminClaimsFilter) && initialData
        ? initialData
        : undefined,
  });

  return (
    <DashboardShell allowedRoles={['ADMIN']}>
      <PageHeader title="All Claims" description="View every claim in the system" />

      <AdminClaimsFilters
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
        emptyTitle="No claims found"
        emptyDescription="Try adjusting your search or filter criteria."
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
            <ClaimRow key={claim.id} claim={claim} />
          ))}
        </div>
      </QueryListPanel>
    </DashboardShell>
  );
}
