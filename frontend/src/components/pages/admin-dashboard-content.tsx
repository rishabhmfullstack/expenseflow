'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, BarChart3 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState } from '@/components/common/states';
import { adminService } from '@/services/admin.service';
import { getApiErrorMessage } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';

import type { MonthlySummary, PaginationMeta } from '@/types';

interface AdminDashboardInitialData {
  summary: { summaries: MonthlySummary[]; meta: PaginationMeta } | null;
  users: { users: unknown[]; meta: PaginationMeta } | null;
  claims: { claims: unknown[]; meta: PaginationMeta } | null;
}

export function AdminDashboardContent({
  initialData,
}: {
  initialData?: AdminDashboardInitialData | null;
}) {
  const summaryQuery = useQuery({
    queryKey: ['admin', 'summary', 1],
    queryFn: () => adminService.monthlySummary({ page: 1, limit: 3 }),
    initialData: initialData?.summary ?? undefined,
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', 'count'],
    queryFn: () => adminService.listUsers({ page: 1, limit: 1 }),
    initialData: initialData?.users ?? undefined,
  });

  const claimsQuery = useQuery({
    queryKey: ['admin', 'claims', 'count'],
    queryFn: () => adminService.listClaims({ page: 1, limit: 1 }),
    initialData: initialData?.claims ?? undefined,
  });

  const isLoading = summaryQuery.isLoading || usersQuery.isLoading || claimsQuery.isLoading;
  const isError = summaryQuery.isError || usersQuery.isError || claimsQuery.isError;
  const error = summaryQuery.error ?? usersQuery.error ?? claimsQuery.error;

  const latestMonth = summaryQuery.data?.summaries[0];

  return (
    <DashboardShell allowedRoles={['ADMIN']}>
      <PageHeader title="Admin Dashboard" description="System overview and management" />

      {isLoading && <LoadingState />}
      {isError && (
        <ErrorState
          message={getApiErrorMessage(error)}
          onRetry={() => {
            summaryQuery.refetch();
            usersQuery.refetch();
            claimsQuery.refetch();
          }}
        />
      )}

      {!isLoading && !isError && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total users</p>
              <p className="mt-1 text-2xl font-bold">{usersQuery.data?.meta.total ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total claims</p>
              <p className="mt-1 text-2xl font-bold">{claimsQuery.data?.meta.total ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Latest month claimed</p>
              <p className="mt-1 text-2xl font-bold">
                {latestMonth ? formatCurrency(latestMonth.totalClaimed) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Latest month approved</p>
              <p className="mt-1 text-2xl font-bold">
                {latestMonth ? formatCurrency(latestMonth.totalApproved) : '—'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/admin/users"
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <Users className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-900">Manage users</p>
                <p className="text-sm text-slate-500">CRUD, assign, deactivate</p>
              </div>
            </Link>
            <Link
              href="/admin/claims"
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-900">All claims</p>
                <p className="text-sm text-slate-500">View every claim</p>
              </div>
            </Link>
            <Link
              href="/admin/summary"
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-900">Monthly summary</p>
                <p className="text-sm text-slate-500">Claimed vs approved</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
