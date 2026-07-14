import { ApprovalAction, ApprovalStep, ClaimStatus, Prisma, Role } from '@prisma/client';

type ApprovalHistoryWithActor = {
  id: string;
  claimId: string;
  action: ApprovalAction;
  step: ApprovalStep;
  note: string | null;
  createdAt: Date;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
};

export interface ApprovalHistoryResponse {
  id: string;
  claimId: string;
  action: ApprovalAction;
  step: ApprovalStep;
  note: string | null;
  createdAt: string;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

export interface ManagerActionHistoryResponse extends ApprovalHistoryResponse {
  previousStatus: ClaimStatus;
  newStatus: ClaimStatus;
  claim: {
    id: string;
    amount: number;
    category: string;
    description: string;
    status: ClaimStatus;
    expenseDate: string;
  };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function toApprovalHistoryResponse(
  entry: ApprovalHistoryWithActor,
): ApprovalHistoryResponse {
  return {
    id: entry.id,
    claimId: entry.claimId,
    action: entry.action,
    step: entry.step,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
    actor: entry.actor,
  };
}

type ManagerActionHistoryRecord = ApprovalHistoryWithActor & {
  previousStatus: ClaimStatus;
  newStatus: ClaimStatus;
  claim: {
    id: string;
    amount: Prisma.Decimal;
    category: string;
    description: string;
    status: ClaimStatus;
    expenseDate: Date;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

export function toManagerActionHistoryResponse(
  entry: ManagerActionHistoryRecord,
): ManagerActionHistoryResponse {
  const base = toApprovalHistoryResponse(entry);

  return {
    ...base,
    previousStatus: entry.previousStatus,
    newStatus: entry.newStatus,
    claim: {
      id: entry.claim.id,
      amount: Number(entry.claim.amount),
      category: entry.claim.category,
      description: entry.claim.description,
      status: entry.claim.status,
      expenseDate: entry.claim.expenseDate.toISOString(),
    },
    employee: entry.claim.employee,
  };
}
