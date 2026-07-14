import { api } from '@/lib/api';
import type {
  ClaimStatus,
  ClaimWithEmployee,
  ExpenseCategory,
  MonthlySummary,
  PaginationMeta,
  Role,
  UserWithManager,
} from '@/types';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface ListAllClaimsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  category?: ExpenseCategory;
  employeeId?: string;
  expenseDateFrom?: string;
  expenseDateTo?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  managerId?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  managerId?: string | null;
  isActive?: boolean;
}

export const adminService = {
  async listUsers(params: ListUsersParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { users: UserWithManager[] };
      meta: PaginationMeta;
    }>('/admin/users', { params });
    return { users: data.data.users, meta: data.meta };
  },

  async getUser(id: string) {
    const { data } = await api.get<{ success: true; data: { user: UserWithManager } }>(
      `/admin/users/${id}`,
    );
    return data.data.user;
  },

  async createUser(input: CreateUserInput) {
    const { data } = await api.post<{ success: true; data: { user: UserWithManager } }>(
      '/admin/users',
      input,
    );
    return data.data.user;
  },

  async updateUser(id: string, input: UpdateUserInput) {
    const { data } = await api.patch<{ success: true; data: { user: UserWithManager } }>(
      `/admin/users/${id}`,
      input,
    );
    return data.data.user;
  },

  async deleteUser(id: string) {
    await api.delete(`/admin/users/${id}`);
  },

  async deactivateUser(id: string) {
    const { data } = await api.post<{ success: true; data: { user: UserWithManager } }>(
      `/admin/users/${id}/deactivate`,
    );
    return data.data.user;
  },

  async assignToManager(userId: string, managerId: string) {
    const { data } = await api.post<{ success: true; data: { user: UserWithManager } }>(
      `/admin/users/${userId}/assign-to-manager`,
      { managerId },
    );
    return data.data.user;
  },

  async assignToSeniorManager(managerId: string, seniorManagerId: string) {
    const { data } = await api.post<{ success: true; data: { user: UserWithManager } }>(
      `/admin/users/${managerId}/assign-to-senior-manager`,
      { seniorManagerId },
    );
    return data.data.user;
  },

  async listClaims(params: ListAllClaimsParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { claims: ClaimWithEmployee[] };
      meta: PaginationMeta;
    }>('/admin/claims', { params });
    return { claims: data.data.claims, meta: data.meta };
  },

  async monthlySummary(params: { page?: number; limit?: number; year?: number } = {}) {
    const { data } = await api.get<{
      success: true;
      data: { summaries: MonthlySummary[] };
      meta: PaginationMeta;
    }>('/admin/summary/monthly', { params });
    return { summaries: data.data.summaries, meta: data.meta };
  },
};
