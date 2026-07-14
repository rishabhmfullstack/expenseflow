import type { AxiosError, AxiosInstance } from 'axios';
import type { ApiErrorResponse } from '@/types';
import { ApiError } from '../errors';

export function attachErrorResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => Promise.reject(ApiError.fromAxiosError(error)),
  );
}
