import type { AuthResponse } from '@/types';
import { setAccessToken } from '@/lib/auth-storage';
import { refreshClient } from './refresh-client';

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
      return;
    }

    resolve(token);
  });

  refreshQueue = [];
}

export async function refreshAccessToken(): Promise<string> {
  const { data } = await refreshClient.post<{ success: true; data: AuthResponse }>(
    '/auth/refresh',
    {},
  );

  setAccessToken(data.data.accessToken);
  return data.data.accessToken;
}

export function queueTokenRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

export function getIsRefreshing(): boolean {
  return isRefreshing;
}

export async function runTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    return queueTokenRefresh();
  }

  isRefreshing = true;

  try {
    const token = await refreshAccessToken();
    processQueue(null, token);
    return token;
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}
