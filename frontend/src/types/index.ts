export type Role = 'EMPLOYEE' | 'MANAGER' | 'SENIOR_MANAGER' | 'ADMIN';

export type ClaimStatus =
  | 'DRAFT'
  | 'REVERTED_TO_EMPLOYEE'
  | 'PENDING_MANAGER'
  | 'REVERTED_TO_MANAGER'
  | 'PENDING_SENIOR_MANAGER'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ExpenseCategory =
  | 'TRAVEL'
  | 'MEALS'
  | 'ACCOMMODATION'
  | 'SUPPLIES'
  | 'SOFTWARE'
  | 'TRAINING'
  | 'OTHER';

export type ApprovalAction =
  | 'SUBMITTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REVISION_REQUESTED';

export type ApprovalStep = 'MANAGER' | 'SENIOR_MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  managerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithManager extends User {
  manager: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'> | null;
}

export interface Claim {
  id: string;
  employeeId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl: string | null;
  expenseDate: string;
  status: ClaimStatus;
  pendingWith: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimWithEmployee extends Claim {
  employee: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface ApprovalHistoryEntry {
  id: string;
  claimId: string;
  action: ApprovalAction;
  step: ApprovalStep;
  note: string | null;
  createdAt: string;
  actor: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>;
}

export interface ManagerActionHistoryEntry extends ApprovalHistoryEntry {
  previousStatus: ClaimStatus;
  newStatus: ClaimStatus;
  claim: Pick<Claim, 'id' | 'amount' | 'category' | 'description' | 'status' | 'expenseDate'>;
  employee: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface MonthlySummary {
  month: string;
  totalClaimed: number;
  totalApproved: number;
  claimCount: number;
  approvedCount: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'TRAVEL',
  'MEALS',
  'ACCOMMODATION',
  'SUPPLIES',
  'SOFTWARE',
  'TRAINING',
  'OTHER',
];

export const MANAGER_HISTORY_STATUS_OPTIONS: ClaimStatus[] = [
  'PENDING_SENIOR_MANAGER',
  'APPROVED',
  'REJECTED',
  'REVERTED_TO_EMPLOYEE',
];

export const ROLE_DASHBOARD: Record<Role, string> = {
  EMPLOYEE: '/employee',
  MANAGER: '/manager',
  SENIOR_MANAGER: '/senior-manager',
  ADMIN: '/admin',
};
