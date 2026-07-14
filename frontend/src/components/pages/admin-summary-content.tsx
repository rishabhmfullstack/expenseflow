'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DataTable, PageHeader, QueryListPanel } from '@/components/common';
import { MonthlySummaryFilters } from '@/components/filters/monthly-summary-filters';
import { adminService } from '@/services/admin.service';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatCurrency } from '@/lib/utils';
import {
  defaultMonthlySummaryFilter,
  type MonthlySummaryFilterValues,
} from '@/schemas/filter.schema';
import type { MonthlySummary, PaginationMeta } from '@/types';

const PAGE_SIZE = 12;

export function AdminSummaryContent({
  initialData,
}: {
  initialData?: { summaries: MonthlySummary[]; meta: PaginationMeta } | null;
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MonthlySummaryFilterValues>(defaultMonthlySummaryFilter);
  const debouncedYear = useDebouncedValue(filters.year, 400);
  const isYearPending = filters.year !== debouncedYear;

  useEffect(() => {
    setPage(1);
  }, [debouncedYear]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'summary', { page, year: debouncedYear }],
    queryFn: () =>
      adminService.monthlySummary({
        page,
        limit: PAGE_SIZE,
        year: debouncedYear ? Number(debouncedYear) : undefined,
      }),
    initialData:
      page === 1 && debouncedYear === defaultMonthlySummaryFilter.year && initialData
        ? initialData
        : undefined,
  });

  const columns = [
    {
      key: 'month',
      header: 'Month',
      render: (row: MonthlySummary) => <span className="font-medium">{row.month}</span>,
    },
    {
      key: 'totalClaimed',
      header: 'Total Claimed',
      render: (row: MonthlySummary) => formatCurrency(row.totalClaimed),
    },
    {
      key: 'totalApproved',
      header: 'Total Approved',
      className: 'text-emerald-700',
      render: (row: MonthlySummary) => formatCurrency(row.totalApproved),
    },
    {
      key: 'claimCount',
      header: 'Claims',
      render: (row: MonthlySummary) => row.claimCount,
    },
    {
      key: 'approvedCount',
      header: 'Approved',
      render: (row: MonthlySummary) => row.approvedCount,
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN']}>
      <PageHeader
        title="Monthly Summary"
        description="Total claimed vs approved, grouped by expense month"
      />

      <MonthlySummaryFilters
        values={filters}
        onYearChange={(year) => setFilters({ year })}
        onReset={() => {
          setFilters(defaultMonthlySummaryFilter);
          setPage(1);
        }}
        isYearPending={isYearPending || isFetching}
      />

      <QueryListPanel
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.summaries.length}
        emptyTitle="No summary data"
        emptyDescription="No claims found for the selected period."
        skeleton="table"
        skeletonColumns={5}
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
        {data && (
          <DataTable
            columns={columns}
            data={data.summaries}
            keyExtractor={(row) => row.month}
          />
        )}
      </QueryListPanel>
    </DashboardShell>
  );
}
