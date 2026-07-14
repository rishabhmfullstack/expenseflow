import { buildQueryString, serverApiGet } from '@/lib/api/server-api';
import type {
  Claim,
  ClaimWithEmployee,
  ManagerActionHistoryEntry,
  MonthlySummary,
  PaginationMeta,
  UserWithManager,
} from '@/types';

export async function fetchEmployeeClaimsServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ claims: Claim[] }, PaginationMeta>(
    `/claims${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.claims || !response.meta) {
    return null;
  }

  return { claims: response.data.claims, meta: response.meta };
}

export async function fetchEmployeeClaimServer(id: string) {
  const response = await serverApiGet<{ claim: Claim }>(`/claims/${id}`);
  return response?.data.claim ?? null;
}

export async function fetchManagerPendingClaimsServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ claims: ClaimWithEmployee[] }, PaginationMeta>(
    `/manager/claims${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.claims || !response.meta) {
    return null;
  }

  return { claims: response.data.claims, meta: response.meta };
}

export async function fetchManagerClaimServer(id: string) {
  const response = await serverApiGet<{ claim: ClaimWithEmployee }>(`/manager/claims/${id}`);
  return response?.data.claim ?? null;
}

export async function fetchManagerHistoryServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ history: ManagerActionHistoryEntry[] }, PaginationMeta>(
    `/manager/history${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.history || !response.meta) {
    return null;
  }

  return { history: response.data.history, meta: response.meta };
}

export async function fetchSeniorManagerPendingClaimsServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ claims: ClaimWithEmployee[] }, PaginationMeta>(
    `/senior-manager/claims${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.claims || !response.meta) {
    return null;
  }

  return { claims: response.data.claims, meta: response.meta };
}

export async function fetchSeniorManagerClaimServer(id: string) {
  const response = await serverApiGet<{ claim: ClaimWithEmployee }>(`/senior-manager/claims/${id}`);
  return response?.data.claim ?? null;
}

export async function fetchAdminUsersServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ users: UserWithManager[] }, PaginationMeta>(
    `/admin/users${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.users || !response.meta) {
    return null;
  }

  return { users: response.data.users, meta: response.meta };
}

export async function fetchAdminClaimsServer(page = 1, limit = 10) {
  const response = await serverApiGet<{ claims: ClaimWithEmployee[] }, PaginationMeta>(
    `/admin/claims${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.claims || !response.meta) {
    return null;
  }

  return { claims: response.data.claims, meta: response.meta };
}

export async function fetchAdminSummaryServer(page = 1, limit = 12) {
  const response = await serverApiGet<{ summaries: MonthlySummary[] }, PaginationMeta>(
    `/admin/summary/monthly${buildQueryString({ page, limit })}`,
  );

  if (!response?.data.summaries || !response.meta) {
    return null;
  }

  return { summaries: response.data.summaries, meta: response.meta };
}

export async function fetchAdminDashboardServer() {
  const [summary, users, claims] = await Promise.all([
    fetchAdminSummaryServer(1, 3),
    fetchAdminUsersServer(1, 1),
    fetchAdminClaimsServer(1, 1),
  ]);

  return { summary, users, claims };
}
