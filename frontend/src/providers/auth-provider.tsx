'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth-storage';
import { getApiErrorMessage, registerAuthFailureHandler } from '@/lib/api';
import type { LoginFormValues, SignupFormValues } from '@/schemas/auth.schema';
import { ROLE_DASHBOARD, type Role, type User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginFormValues) => Promise<void>;
  signup: (input: SignupFormValues) => Promise<void>;
  logout: () => Promise<void>;
  loginError: string | null;
  signupError: string | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getAccessToken());
  }, []);

  useEffect(() => {
    return registerAuthFailureHandler(() => {
      setHasToken(false);
      setLoginError(null);
      setSignupError(null);
      queryClient.clear();
      router.replace('/login');
    });
  }, [queryClient, router]);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken, data.user.role);
      setHasToken(true);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push(ROLE_DASHBOARD[data.user.role]);
    },
    onError: (error) => setLoginError(getApiErrorMessage(error, 'Login failed')),
  });

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      setAccessToken(data.accessToken, data.user.role);
      setHasToken(true);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push(ROLE_DASHBOARD[data.user.role]);
    },
    onError: (error) => setSignupError(getApiErrorMessage(error, 'Signup failed')),
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAccessToken();
      setHasToken(false);
      queryClient.clear();
      router.push('/login');
    },
  });

  const login = useCallback(
    async (input: LoginFormValues) => {
      setLoginError(null);
      try {
        await loginMutation.mutateAsync(input);
      } catch {
        // Invalid credentials and other login failures are surfaced via loginError.
      }
    },
    [loginMutation],
  );

  const signup = useCallback(
    async (input: SignupFormValues) => {
      setSignupError(null);
      try {
        await signupMutation.mutateAsync(input);
      } catch {
        // Signup failures are surfaced via signupError.
      }
    },
    [signupMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: hasToken && meQuery.isLoading,
      isAuthenticated: !!meQuery.data,
      login,
      signup,
      logout,
      loginError,
      signupError,
      isLoggingIn: loginMutation.isPending,
      isSigningUp: signupMutation.isPending,
    }),
    [
      meQuery.data,
      meQuery.isLoading,
      hasToken,
      login,
      signup,
      logout,
      loginError,
      signupError,
      loginMutation.isPending,
      signupMutation.isPending,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireRole(allowedRoles: Role[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(ROLE_DASHBOARD[user.role]);
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router]);

  return { user, isLoading };
}
