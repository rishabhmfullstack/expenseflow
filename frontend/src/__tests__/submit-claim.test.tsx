import userEvent from '@testing-library/user-event';
import { renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ClaimSubmitActions } from '@/components/claims/claim-submit-actions';
import { useEmployeeClaimActions } from '@/hooks/use-employee-claim-actions';
import { ToastProvider } from '@/providers/toast-provider';
import { claimService } from '@/services/claim.service';
import { renderWithProviders, createMockClaim } from '@/test/test-utils';

jest.mock('@/services/claim.service', () => ({
  claimService: {
    submitClaim: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const submitClaimMock = jest.mocked(claimService.submitClaim);

describe('Submit and resubmit claim actions', () => {
  beforeEach(() => {
    submitClaimMock.mockReset();
  });

  it('shows submit for a draft claim and calls the handler', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const claim = createMockClaim({ status: 'DRAFT' });

    renderWithProviders(<ClaimSubmitActions claim={claim} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /submit claim/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows resubmit after a manager sends the claim back', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const claim = createMockClaim({ status: 'REVERTED_TO_EMPLOYEE' });

    renderWithProviders(<ClaimSubmitActions claim={claim} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /resubmit claim/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('hides actions when the claim is pending review', () => {
    renderWithProviders(
      <ClaimSubmitActions claim={createMockClaim({ status: 'PENDING_MANAGER' })} onSubmit={jest.fn()} />,
    );

    expect(screen.queryByRole('button', { name: /submit claim/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resubmit claim/i })).not.toBeInTheDocument();
  });

  it('calls the submit API through the employee claim actions hook', async () => {
    submitClaimMock.mockResolvedValue(createMockClaim({ id: 'claim-42', status: 'PENDING_MANAGER' }));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useEmployeeClaimActions('claim-42', createMockClaim({ id: 'claim-42', status: 'DRAFT' })),
      { wrapper },
    );

    result.current.submitMutation.mutate();

    await waitFor(() => {
      expect(submitClaimMock).toHaveBeenCalledWith('claim-42');
    });
  });
});
