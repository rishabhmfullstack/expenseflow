'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/common/states';
import { ClaimRow } from '@/components/claims/claim-row';
import { Button } from '@/components/ui/button';
import { claimService } from '@/services/claim.service';
import { getApiErrorMessage } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';

export function EmployeeDashboardContent({
  initialData,
}: {
  initialData?: { claims: import('@/types').Claim[]; meta: import('@/types').PaginationMeta } | null;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['claims', 'recent'],
    queryFn: () => claimService.list({ page: 1, limit: 5 }),
    initialData: initialData ?? undefined,
  });

  const claims = data?.claims ?? [];
  const totalAmount = claims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <DashboardShell allowedRoles={['EMPLOYEE']}>
      <PageHeader
        title="Employee Dashboard"
        description="Manage your expense claims"
        action={
          <Link href="/employee/claims/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New claim
            </Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Recent claims</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data?.meta.total ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Recent total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {isLoading ? '—' : formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Draft / reverted</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {claims.filter((c) => c.status === 'DRAFT' || c.status === 'REVERTED_TO_EMPLOYEE').length}
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent claims</h2>
      {isLoading && <LoadingState />}
      {isError && (
        <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
      )}
      {!isLoading && !isError && claims.length === 0 && (
        <EmptyState
          title="No claims yet"
          description="Create your first expense claim to get started."
          action={
            <Link href="/employee/claims/new">
              <Button>Create claim</Button>
            </Link>
          }
        />
      )}
      {!isLoading && !isError && claims.length > 0 && (
        <div className="space-y-3">
          {claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} href={`/employee/claims/${claim.id}`} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
