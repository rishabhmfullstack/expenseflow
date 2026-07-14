import { api } from '@/lib/api';
import type { Claim, ExpenseCategory, ClaimStatus, PaginationMeta } from '@/types';

export interface ListClaimsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  category?: ExpenseCategory;
  expenseDateFrom?: string;
  expenseDateTo?: string;
}

export interface CreateClaimInput {
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string;
  expenseDate: string;
}

export type UpdateClaimInput = Partial<CreateClaimInput>;

export const claimService = {
  async list(params: ListClaimsParams = {}) {
    const { data } = await api.get<{
      success: true;
      data: { claims: Claim[] };
      meta: PaginationMeta;
    }>('/claims', { params });
    return { claims: data.data.claims, meta: data.meta };
  },

  async getById(id: string) {
    const { data } = await api.get<{ success: true; data: { claim: Claim } }>(`/claims/${id}`);
    return data.data.claim;
  },

  async create(input: CreateClaimInput) {
    const { data } = await api.post<{ success: true; data: { claim: Claim } }>('/claims', input);
    return data.data.claim;
  },

  async update(id: string, input: UpdateClaimInput) {
    const { data } = await api.patch<{ success: true; data: { claim: Claim } }>(
      `/claims/${id}`,
      input,
    );
    return data.data.claim;
  },

  async delete(id: string) {
    await api.delete(`/claims/${id}`);
  },

  async submitClaim(id: string) {
    const { data } = await api.post<{ success: true; data: { claim: Claim } }>(
      `/claims/${id}/submit`,
    );
    return data.data.claim;
  },
};
