'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLatestRevisionNote } from '@/lib/claim-status';
import { approvalHistoryService } from '@/services/approval-history.service';
import { claimService } from '@/services/claim.service';

import type { Claim } from '@/types';

export function useEmployeeClaimDetail(claimId: string, initialClaim?: Claim | null) {
  const claimQuery = useQuery({
    queryKey: ['claims', claimId],
    queryFn: () => claimService.getById(claimId),
    initialData: initialClaim ?? undefined,
  });

  const shouldLoadRevisionNote = claimQuery.data?.status === 'REVERTED_TO_EMPLOYEE';

  const historyQuery = useQuery({
    queryKey: ['approval-history', 'employee', claimId],
    queryFn: () => approvalHistoryService.list('employee', claimId),
    enabled: shouldLoadRevisionNote,
  });

  const revertNote = useMemo(() => {
    if (!shouldLoadRevisionNote || !historyQuery.data) {
      return null;
    }

    return getLatestRevisionNote(historyQuery.data);
  }, [shouldLoadRevisionNote, historyQuery.data]);

  return {
    claim: claimQuery.data,
    revertNote,
    claimQuery,
    historyQuery,
    isLoading: claimQuery.isLoading,
    isError: claimQuery.isError,
    error: claimQuery.error,
    refetch: claimQuery.refetch,
  };
}
