import { clearAccessToken } from '@/lib/auth-storage';
import { refreshClient } from './refresh-client';

type AuthFailureHandler = () => void | Promise<void>;

let authFailureHandler: AuthFailureHandler | null = null;
let authFailureInProgress = false;

export function registerAuthFailureHandler(handler: AuthFailureHandler): () => void {
  authFailureHandler = handler;

  return () => {
    if (authFailureHandler === handler) {
      authFailureHandler = null;
    }
  };
}

export async function handleAuthFailure(): Promise<void> {
  if (authFailureInProgress) {
    return;
  }

  authFailureInProgress = true;

  try {
    clearAccessToken();

    try {
      await refreshClient.post('/auth/logout');
    } catch {
      // Best-effort server logout when refresh has already failed.
    }

    if (authFailureHandler) {
      await authFailureHandler();
      return;
    }

    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.replace('/login');
    }
  } finally {
    authFailureInProgress = false;
  }
}
