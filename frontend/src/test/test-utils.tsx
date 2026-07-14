import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ToastProvider } from '@/providers/toast-provider';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export function createMockClaim(overrides: Partial<import('@/types').Claim> = {}): import('@/types').Claim {
  return {
    id: 'claim-1',
    employeeId: 'employee-1',
    amount: 150,
    category: 'MEALS',
    description: 'Client lunch',
    receiptUrl: null,
    expenseDate: '2026-07-01T00:00:00.000Z',
    status: 'DRAFT',
    pendingWith: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
    ...overrides,
  };
}

export function createMockClaimWithEmployee(
  overrides: Partial<import('@/types').ClaimWithEmployee> = {},
): import('@/types').ClaimWithEmployee {
  return {
    ...createMockClaim(overrides),
    employee: {
      id: 'employee-1',
      firstName: 'Ella',
      lastName: 'Employee',
      email: 'employee@test.expenseflow.com',
    },
    ...overrides,
  };
}
