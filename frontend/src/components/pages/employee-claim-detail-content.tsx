'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader, LoadingState, ErrorState } from '@/components/common/states';
import { FormCard } from '@/components/forms';
import { ExpenseForm, isClaimEditable } from '@/components/claims/expense-form';
import { ApprovalHistoryPanel } from '@/components/claims/approval-history-panel';
import { ClaimSubmitActions } from '@/components/claims/claim-submit-actions';
import { ReviewerNoteBanner } from '@/components/claims/reviewer-note-banner';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEmployeeClaimActions } from '@/hooks/use-employee-claim-actions';
import { useEmployeeClaimDetail } from '@/hooks/use-employee-claim-detail';
import { getApiErrorMessage } from '@/lib/api';

import type { Claim } from '@/types';

export function EmployeeClaimDetailContent({
  id,
  initialClaim,
}: {
  id: string;
  initialClaim?: Claim | null;
}) {
  const { claim, revertNote, isLoading, isError, error, refetch } = useEmployeeClaimDetail(
    id,
    initialClaim,
  );
  const { updateMutation, deleteMutation, submitMutation } = useEmployeeClaimActions(id, claim);

  const editable = claim ? isClaimEditable(claim) : false;

  return (
    <DashboardShell allowedRoles={['EMPLOYEE']}>
      <PageHeader
        title="Claim details"
        description={claim ? `Status: ${claim.status.replaceAll('_', ' ').toLowerCase()}` : undefined}
        action={claim && <StatusBadge status={claim.status} />}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />}

      {claim && (
        <div className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            {revertNote && <ReviewerNoteBanner entry={revertNote} />}

            <div className="flex justify-end">
              <ClaimSubmitActions
                claim={claim}
                onSubmit={() => submitMutation.mutate()}
                isSubmitting={submitMutation.isPending}
              />
            </div>

            <FormCard title={editable ? 'Edit claim' : 'View claim'}>
              <ExpenseForm
                defaultValues={{
                  amount: claim.amount,
                  category: claim.category,
                  description: claim.description,
                  receiptUrl: claim.receiptUrl ?? '',
                  expenseDate: claim.expenseDate.split('T')[0],
                }}
                disabled={!editable}
                onSubmit={async (values) => {
                  try {
                    await updateMutation.mutateAsync(values);
                  } catch {
                    // Errors are surfaced via toast in useEmployeeClaimActions.
                  }
                }}
                submitLabel="Save changes"
              />
            </FormCard>

            {editable && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Delete this claim?')) {
                    deleteMutation.mutate();
                  }
                }}
                isLoading={deleteMutation.isPending}
              >
                Delete claim
              </Button>
            )}
          </div>

          <ApprovalHistoryPanel claimId={id} scope="employee" />
        </div>
      )}
    </DashboardShell>
  );
}
