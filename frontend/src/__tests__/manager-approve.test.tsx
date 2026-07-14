import '@/test/mocks';

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { ManagerClaimDetailContent } from '@/components/pages/manager-claim-detail-content';
import { managerService } from '@/services/manager.service';
import { createMockClaimWithEmployee, renderWithProviders } from '@/test/test-utils';

jest.mock('@/services/manager.service', () => ({
  managerService: {
    getPending: jest.fn(),
    approve: jest.fn(),
    approveAfterRevert: jest.fn(),
    reject: jest.fn(),
    revertToEmployee: jest.fn(),
  },
}));

const getPendingMock = jest.mocked(managerService.getPending);
const approveMock = jest.mocked(managerService.approve);

describe('Manager approve workflow', () => {
  beforeEach(() => {
    getPendingMock.mockReset();
    approveMock.mockReset();
  });

  it('approves a pending claim from the review screen', async () => {
    const user = userEvent.setup();
    const pendingClaim = createMockClaimWithEmployee({
      id: 'claim-99',
      status: 'PENDING_MANAGER',
      pendingWith: 'manager-1',
    });

    getPendingMock.mockResolvedValue(pendingClaim);
    approveMock.mockResolvedValue({
      ...pendingClaim,
      status: 'PENDING_SENIOR_MANAGER',
    });

    renderWithProviders(
      <ManagerClaimDetailContent id="claim-99" initialClaim={pendingClaim} />,
    );

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() => {
      expect(approveMock).toHaveBeenCalledWith('claim-99');
    });
  });
});
