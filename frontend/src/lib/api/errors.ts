import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const apiError = error.response?.data?.error;

    if (apiError) {
      return new ApiError(
        apiError.message,
        apiError.code,
        error.response?.status,
        apiError.details,
      );
    }

    if (error.response) {
      return new ApiError(
        `Request failed with status ${error.response.status}`,
        'HTTP_ERROR',
        error.response.status,
      );
    }

    if (error.request) {
      return new ApiError('Network error. Check your connection and try again.', 'NETWORK_ERROR');
    }

    return new ApiError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR');
  }

  static fromUnknown(error: unknown, fallback = 'Something went wrong'): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return ApiError.fromAxiosError(error);
    }

    if (error instanceof Error) {
      return new ApiError(error.message, 'UNKNOWN_ERROR');
    }

    return new ApiError(fallback, 'UNKNOWN_ERROR');
  }
}

export function normalizeApiError(error: unknown, fallback = 'Something went wrong'): ApiError {
  return ApiError.fromUnknown(error, fallback);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  return normalizeApiError(error, fallback).message;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}
