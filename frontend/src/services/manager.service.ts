import { api } from '@/lib/api';
import type {
  ClaimStatus,
  ClaimWithEmployee,
  ExpenseCategory,
  ManagerActionHistoryEntry,
  PaginationMeta,
} from '@/types';

export interface ListPendingParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ExpenseCategory;
  expenseDateFrom?: string;
  expenseDateTo?: string;
}

export interface ListManagerHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  actionDateFrom?: string;
  actionDateTo?: string;
}

export const managerService = {
  async listPending(params: ListPendingParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { claims: ClaimWithEmployee[] };
      meta: PaginationMeta;
    }>('/manager/claims', { params });
    return { claims: data.data.claims, meta: data.meta };
  },

  async getPending(id: string) {
    const { data } = await api.get<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/manager/claims/${id}`,
    );
    return data.data.claim;
  },

  async approve(id: string, note?: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/manager/claims/${id}/approve`,
      { note },
    );
    return data.data.claim;
  },

  async approveAfterRevert(id: string, note?: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/manager/claims/${id}/approve-after-revert`,
      { note },
    );
    return data.data.claim;
  },

  async reject(id: string, note: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/manager/claims/${id}/reject`,
      { note },
    );
    return data.data.claim;
  },

  async revertToEmployee(id: string, note: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/manager/claims/${id}/revert-to-employee`,
      { note },
    );
    return data.data.claim;
  },

  async listHistory(params: ListManagerHistoryParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { history: ManagerActionHistoryEntry[] };
      meta: PaginationMeta;
    }>('/manager/history', { params });
    return { history: data.data.history, meta: data.meta };
  },
};
