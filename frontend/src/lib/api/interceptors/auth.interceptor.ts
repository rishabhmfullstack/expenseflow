import type { AxiosError, AxiosInstance } from 'axios';
import { getAccessToken } from '@/lib/auth-storage';
import { handleAuthFailure } from '../auth-failure';
import { isAuthEndpoint } from '../constants';
import { runTokenRefresh } from '../token-refresh';
import type { ApiRequestConfig } from '../types';

function shouldAttemptRefresh(error: AxiosError, config?: ApiRequestConfig): config is ApiRequestConfig {
  if (!config || config._retry || config.skipAuthRefresh) {
    return false;
  }

  if (error.response?.status !== 401) {
    return false;
  }

  return !isAuthEndpoint(config.url);
}

export function attachAuthRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

export function attachAuthResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ApiRequestConfig | undefined;

      if (!shouldAttemptRefresh(error, originalRequest)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const token = await runTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      } catch (refreshError) {
        await handleAuthFailure();
        return Promise.reject(refreshError);
      }
    },
  );
}
