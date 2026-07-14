'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, QueryListPanel } from '@/components/common';
import { ClaimRow } from '@/components/claims/claim-row';
import { EmployeeClaimsFilters } from '@/components/filters/employee-claims-filters';
import { Button } from '@/components/ui/button';
import { claimService } from '@/services/claim.service';
import { usePaginatedFilters } from '@/hooks/use-paginated-filters';
import {
  defaultEmployeeClaimsFilter,
  type EmployeeClaimsFilterValues,
} from '@/schemas/filter.schema';
import { isDefaultPageQuery } from '@/lib/react-query/initial-data';
import type { Claim, ClaimStatus, ExpenseCategory, PaginationMeta } from '@/types';

const PAGE_SIZE = 10;

export function EmployeeClaimsContent({
  initialData,
}: {
  initialData?: { claims: Claim[]; meta: PaginationMeta } | null;
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
  } = usePaginatedFilters<EmployeeClaimsFilterValues>({
    defaults: defaultEmployeeClaimsFilter,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['claims', { page, filters: queryFilters }],
    queryFn: () =>
      claimService.list({
        page,
        limit: PAGE_SIZE,
        search: queryFilters.search || undefined,
        status: (queryFilters.status as ClaimStatus) || undefined,
        category: (queryFilters.category as ExpenseCategory) || undefined,
        expenseDateFrom: queryFilters.expenseDateFrom || undefined,
        expenseDateTo: queryFilters.expenseDateTo || undefined,
      }),
    initialData:
      isDefaultPageQuery(page, queryFilters, defaultEmployeeClaimsFilter) && initialData
        ? initialData
        : undefined,
  });

  return (
    <DashboardShell allowedRoles={['EMPLOYEE']}>
      <PageHeader
        title="My Claims"
        description="View and manage your expense claims"
        action={
          <Link href="/employee/claims/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New claim
            </Button>
          </Link>
        }
      />

      <EmployeeClaimsFilters
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
        emptyDescription="Try adjusting your filters or create a new claim."
        emptyAction={
          <Link href="/employee/claims/new">
            <Button>Create claim</Button>
          </Link>
        }
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
            <ClaimRow key={claim.id} claim={claim} href={`/employee/claims/${claim.id}`} />
          ))}
        </div>
      </QueryListPanel>
    </DashboardShell>
  );
}
