import { ApprovalAction, ApprovalStep, ClaimStatus } from '@prisma/client';

type HistoryEntryForReplay = {
  id: string;
  action: ApprovalAction;
  step: ApprovalStep;
  actor: {
    managerId: string | null;
  };
};

export interface StatusTransition {
  previousStatus: ClaimStatus;
  newStatus: ClaimStatus;
}

export function getStatusAfterAction(
  currentStatus: ClaimStatus,
  entry: HistoryEntryForReplay,
): ClaimStatus {
  if (entry.step === ApprovalStep.MANAGER) {
    switch (entry.action) {
      case ApprovalAction.SUBMITTED:
      case ApprovalAction.RESUBMITTED:
        return ClaimStatus.PENDING_MANAGER;
      case ApprovalAction.APPROVED:
        return entry.actor.managerId
          ? ClaimStatus.PENDING_SENIOR_MANAGER
          : ClaimStatus.APPROVED;
      case ApprovalAction.REJECTED:
        return ClaimStatus.REJECTED;
      case ApprovalAction.REVISION_REQUESTED:
        return ClaimStatus.REVERTED_TO_EMPLOYEE;
      default:
        return currentStatus;
    }
  }

  if (entry.step === ApprovalStep.SENIOR_MANAGER) {
    switch (entry.action) {
      case ApprovalAction.APPROVED:
        return ClaimStatus.APPROVED;
      case ApprovalAction.REJECTED:
        return ClaimStatus.REJECTED;
      case ApprovalAction.REVISION_REQUESTED:
        return ClaimStatus.REVERTED_TO_MANAGER;
      default:
        return currentStatus;
    }
  }

  return currentStatus;
}

export function buildStatusTransitionMap(
  history: HistoryEntryForReplay[],
): Map<string, StatusTransition> {
  const transitions = new Map<string, StatusTransition>();
  let currentStatus: ClaimStatus = ClaimStatus.DRAFT;

  for (const entry of history) {
    const previousStatus = currentStatus;
    currentStatus = getStatusAfterAction(currentStatus, entry);
    transitions.set(entry.id, { previousStatus, newStatus: currentStatus });
  }

  return transitions;
}
