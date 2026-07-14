import '@/test/mocks';

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { SeniorManagerClaimDetailContent } from '@/components/pages/senior-manager-claim-detail-content';
import { seniorManagerService } from '@/services/senior-manager.service';
import { createMockClaimWithEmployee, renderWithProviders } from '@/test/test-utils';

jest.mock('@/services/senior-manager.service', () => ({
  seniorManagerService: {
    getPending: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    revertToManager: jest.fn(),
  },
}));

const getPendingMock = jest.mocked(seniorManagerService.getPending);
const revertToManagerMock = jest.mocked(seniorManagerService.revertToManager);

describe('Senior manager revert workflow', () => {
  beforeEach(() => {
    getPendingMock.mockReset();
    revertToManagerMock.mockReset();
  });

  it('reverts a pending claim back to the manager with a note', async () => {
    const user = userEvent.setup();
    const pendingClaim = createMockClaimWithEmployee({
      id: 'claim-55',
      status: 'PENDING_SENIOR_MANAGER',
      pendingWith: 'sm-1',
    });

    getPendingMock.mockResolvedValue(pendingClaim);
    revertToManagerMock.mockResolvedValue({
      ...pendingClaim,
      status: 'REVERTED_TO_MANAGER',
      pendingWith: 'manager-1',
    });

    renderWithProviders(
      <SeniorManagerClaimDetailContent id="claim-55" initialClaim={pendingClaim} />,
    );

    await user.click(screen.getByRole('button', { name: /revert to manager/i }));
    expect(screen.getByRole('heading', { name: /revert to manager/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/note/i), 'Please confirm the budget code.');
    await user.click(screen.getByRole('button', { name: /^revert$/i }));

    await waitFor(() => {
      expect(revertToManagerMock).toHaveBeenCalledWith(
        'claim-55',
        'Please confirm the budget code.',
      );
    });
  });
});
