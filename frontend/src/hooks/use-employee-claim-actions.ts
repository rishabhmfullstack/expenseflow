'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api';
import { isClaimSubmittable } from '@/lib/claim-status';
import { useToast } from '@/providers/toast-provider';
import { claimService } from '@/services/claim.service';
import type { ClaimFormValues } from '@/schemas/claim.schema';
import type { Claim, PaginationMeta } from '@/types';

interface ClaimListData {
  claims: Claim[];
  meta: PaginationMeta;
}

function toClaimInput(values: ClaimFormValues) {
  return {
    ...values,
    receiptUrl: values.receiptUrl || undefined,
  };
}

export function useEmployeeClaimActions(claimId: string, claim?: Claim) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateMutation = useMutation({
    mutationFn: (values: ClaimFormValues) => claimService.update(claimId, toClaimInput(values)),
    onSuccess: (updatedClaim) => {
      queryClient.setQueryData(['claims', claimId], updatedClaim);
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claim updated');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update claim'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => claimService.delete(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claim deleted');
      router.push('/employee/claims');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete claim'));
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => claimService.submitClaim(claimId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['claims'] });

      const previousClaim = queryClient.getQueryData<Claim>(['claims', claimId]);
      const previousLists = queryClient.getQueriesData<ClaimListData>({ queryKey: ['claims'] });

      if (previousClaim) {
        queryClient.setQueryData<Claim>(['claims', claimId], {
          ...previousClaim,
          status: 'PENDING_MANAGER',
        });
      }

      previousLists.forEach(([queryKey, data]) => {
        if (!data?.claims) {
          return;
        }

        queryClient.setQueryData<ClaimListData>(queryKey, {
          ...data,
          claims: data.claims.map((item) =>
            item.id === claimId ? { ...item, status: 'PENDING_MANAGER' } : item,
          ),
        });
      });

      return { previousClaim, previousLists };
    },
    onError: (error, _, context) => {
      if (context?.previousClaim) {
        queryClient.setQueryData(['claims', claimId], context.previousClaim);
      }

      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      toast.error(getApiErrorMessage(error, 'Failed to submit claim'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['approval-history', 'employee', claimId] });

      const isResubmit = claim?.status === 'REVERTED_TO_EMPLOYEE';
      toast.success(
        isResubmit
          ? 'Claim resubmitted for manager review'
          : 'Claim submitted for manager review',
      );
      router.push('/employee/claims');
    },
  });

  return {
    updateMutation,
    deleteMutation,
    submitMutation,
    isSubmittable: claim ? isClaimSubmittable(claim) : false,
    isResubmit: claim?.status === 'REVERTED_TO_EMPLOYEE',
  };
}
