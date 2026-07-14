'use client';

import { Send } from 'lucide-react';
import { isClaimSubmittable } from '@/lib/claim-status';
import { Button } from '@/components/ui/button';
import type { Claim } from '@/types';

interface ClaimSubmitActionsProps {
  claim: Claim;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ClaimSubmitActions({
  claim,
  onSubmit,
  isSubmitting = false,
}: ClaimSubmitActionsProps) {
  if (!isClaimSubmittable(claim)) {
    return null;
  }

  const isResubmit = claim.status === 'REVERTED_TO_EMPLOYEE';

  return (
    <Button onClick={onSubmit} isLoading={isSubmitting} className="w-full sm:w-auto">
      <Send className="mr-2 h-4 w-4" />
      {isResubmit ? 'Resubmit claim' : 'Submit claim'}
    </Button>
  );
}
