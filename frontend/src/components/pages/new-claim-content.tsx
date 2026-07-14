'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/common/states';
import { FormCard } from '@/components/forms';
import { ExpenseForm } from '@/components/claims/expense-form';
import { useToast } from '@/providers/toast-provider';
import { claimService } from '@/services/claim.service';
import { getApiErrorMessage } from '@/lib/api';
import type { ClaimFormValues } from '@/schemas/claim.schema';

export function NewClaimContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (values: ClaimFormValues) =>
      claimService.create({
        ...values,
        receiptUrl: values.receiptUrl || undefined,
      }),
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Draft claim created');
      router.push(`/employee/claims/${claim.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create claim'));
    },
  });

  return (
    <DashboardShell allowedRoles={['EMPLOYEE']}>
      <PageHeader
        title="New Claim"
        description="Create a draft expense claim, then submit it for manager review"
      />
      <FormCard title="Claim details" className="max-w-2xl">
        <ExpenseForm
          onSubmit={async (values) => {
            try {
              await mutation.mutateAsync(values);
            } catch {
              // Errors are surfaced via toast.
            }
          }}
          submitLabel="Save as draft"
        />
      </FormCard>
    </DashboardShell>
  );
}
