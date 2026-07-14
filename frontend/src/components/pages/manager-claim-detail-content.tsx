'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/common/states';
import { ClaimRow } from '@/components/claims/claim-row';
import { ApprovalHistoryPanel } from '@/components/claims/approval-history-panel';
import { NoteForm } from '@/components/claims/note-form';
import { Button } from '@/components/ui/button';
import { managerService } from '@/services/manager.service';
import { getApiErrorMessage } from '@/lib/axios';

import type { ClaimWithEmployee } from '@/types';

type ActionType = 'reject' | 'revert' | null;

export function ManagerClaimDetailContent({
  id,
  initialClaim,
}: {
  id: string;
  initialClaim?: ClaimWithEmployee | null;
}) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<ActionType>(null);

  const { data: claim, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['manager', 'claim', id],
    queryFn: () => managerService.getPending(id),
    initialData: initialClaim ?? undefined,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['manager'] });
    queryClient.invalidateQueries({ queryKey: ['approval-history', 'manager', id] });
    refetch();
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      claim?.status === 'REVERTED_TO_MANAGER'
        ? managerService.approveAfterRevert(id)
        : managerService.approve(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (note: string) => managerService.reject(id, note),
    onSuccess: () => {
      setAction(null);
      invalidate();
    },
  });

  const revertMutation = useMutation({
    mutationFn: (note: string) => managerService.revertToEmployee(id, note),
    onSuccess: () => {
      setAction(null);
      invalidate();
    },
  });

  return (
    <DashboardShell allowedRoles={['MANAGER']}>
      <PageHeader title="Review claim" description="Take action on this expense claim" />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />}
      {!isLoading && !isError && !claim && (
        <EmptyState title="Claim not found" description="This claim may no longer be pending with you." />
      )}

      {claim && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <ClaimRow claim={claim} />
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => approveMutation.mutate()} isLoading={approveMutation.isPending}>
                {claim.status === 'REVERTED_TO_MANAGER' ? 'Approve after revert' : 'Approve'}
              </Button>
              <Button variant="danger" onClick={() => setAction('reject')}>
                Reject
              </Button>
              <Button variant="secondary" onClick={() => setAction('revert')}>
                Revert to employee
              </Button>
              <Link href="/manager/claims">
                <Button variant="ghost">Back</Button>
              </Link>
            </div>
            {action === 'reject' && (
              <NoteForm
                title="Reject claim"
                submitLabel="Reject"
                variant="danger"
                onCancel={() => setAction(null)}
                onSubmit={async (note) => rejectMutation.mutateAsync(note)}
              />
            )}
            {action === 'revert' && (
              <NoteForm
                title="Revert to employee"
                submitLabel="Revert"
                onCancel={() => setAction(null)}
                onSubmit={async (note) => revertMutation.mutateAsync(note)}
              />
            )}
          </div>

          <ApprovalHistoryPanel claimId={id} scope="manager" />
        </div>
      )}
    </DashboardShell>
  );
}
