import { Claim } from '@prisma/client';

export interface ClaimResponse {
  id: string;
  employeeId: string;
  amount: number;
  category: Claim['category'];
  description: string;
  receiptUrl: string | null;
  expenseDate: Date;
  status: Claim['status'];
  pendingWith: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagerClaimResponse extends ClaimResponse {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function toClaimResponse(claim: Claim): ClaimResponse {
  return {
    id: claim.id,
    employeeId: claim.employeeId,
    amount: Number(claim.amount),
    category: claim.category,
    description: claim.description,
    receiptUrl: claim.receiptUrl,
    expenseDate: claim.expenseDate,
    status: claim.status,
    pendingWith: claim.pendingWith,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export function toManagerClaimResponse(
  claim: Claim & {
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  },
): ManagerClaimResponse {
  return {
    ...toClaimResponse(claim),
    employee: claim.employee,
  };
}
