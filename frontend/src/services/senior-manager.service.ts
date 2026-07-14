import { api } from '@/lib/api';
import type { ClaimWithEmployee, ExpenseCategory, PaginationMeta } from '@/types';

export interface ListPendingParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ExpenseCategory;
  expenseDateFrom?: string;
  expenseDateTo?: string;
}

export const seniorManagerService = {
  async listPending(params: ListPendingParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { claims: ClaimWithEmployee[] };
      meta: PaginationMeta;
    }>('/senior-manager/claims', { params });
    return { claims: data.data.claims, meta: data.meta };
  },

  async getPending(id: string) {
    const { data } = await api.get<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/senior-manager/claims/${id}`,
    );
    return data.data.claim;
  },

  async approve(id: string, note?: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/senior-manager/claims/${id}/approve`,
      { note },
    );
    return data.data.claim;
  },

  async reject(id: string, note: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/senior-manager/claims/${id}/reject`,
      { note },
    );
    return data.data.claim;
  },

  async revertToManager(id: string, note: string) {
    const { data } = await api.post<{ success: true; data: { claim: ClaimWithEmployee } }>(
      `/senior-manager/claims/${id}/revert-to-manager`,
      { note },
    );
    return data.data.claim;
  },
};
