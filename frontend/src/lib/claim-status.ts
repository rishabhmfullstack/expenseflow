import type { ApprovalHistoryEntry, Claim, ClaimStatus } from '@/types';

export const EDITABLE_CLAIM_STATUSES = ['DRAFT', 'REVERTED_TO_EMPLOYEE'] as const satisfies readonly ClaimStatus[];

export const SUBMITTABLE_CLAIM_STATUSES = ['DRAFT', 'REVERTED_TO_EMPLOYEE'] as const satisfies readonly ClaimStatus[];

export function isClaimEditable(claim: Pick<Claim, 'status'>): boolean {
  return EDITABLE_CLAIM_STATUSES.includes(claim.status as (typeof EDITABLE_CLAIM_STATUSES)[number]);
}

export function isClaimSubmittable(claim: Pick<Claim, 'status'>): boolean {
  return SUBMITTABLE_CLAIM_STATUSES.includes(
    claim.status as (typeof SUBMITTABLE_CLAIM_STATUSES)[number],
  );
}

export function getLatestRevisionNote(
  history: ApprovalHistoryEntry[],
): ApprovalHistoryEntry | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.action === 'REVISION_REQUESTED') {
      return history[index] ?? null;
    }
  }

  return null;
}
