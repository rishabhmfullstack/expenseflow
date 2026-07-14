import { api } from '@/lib/api';
import type { ApprovalHistoryEntry } from '@/types';

export type ApprovalHistoryScope = 'employee' | 'manager' | 'senior-manager' | 'admin';

const historyPaths: Record<ApprovalHistoryScope, (claimId: string) => string> = {
  employee: (claimId) => `/claims/${claimId}/history`,
  manager: (claimId) => `/manager/claims/${claimId}/history`,
  'senior-manager': (claimId) => `/senior-manager/claims/${claimId}/history`,
  admin: (claimId) => `/admin/claims/${claimId}/history`,
};

export const approvalHistoryService = {
  async list(scope: ApprovalHistoryScope, claimId: string) {
    const { data } = await api.get<{ success: true; data: { history: ApprovalHistoryEntry[] } }>(
      historyPaths[scope](claimId),
    );

    return data.data.history;
  },
};
