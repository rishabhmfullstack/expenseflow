import '@/test/mocks';

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { ExpenseForm } from '@/components/claims/expense-form';
import { renderWithProviders } from '@/test/test-utils';

describe('Create claim workflow', () => {
  it('submits valid expense details from the create form', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ExpenseForm onSubmit={onSubmit} submitLabel="Save as draft" />,
    );

    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '245.75');
    await user.type(screen.getByLabelText(/description/i), 'Conference travel expenses');
    await user.click(screen.getByRole('button', { name: /save as draft/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        amount: 245.75,
        category: 'TRAVEL',
        description: 'Conference travel expenses',
        expenseDate: '2026-07-14',
        receiptUrl: '',
      }),
    );
  });

  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    renderWithProviders(
      <ExpenseForm onSubmit={onSubmit} submitLabel="Save as draft" />,
    );

    await user.clear(screen.getByLabelText(/amount/i));
    await user.clear(screen.getByLabelText(/description/i));
    await user.click(screen.getByRole('button', { name: /save as draft/i }));

    expect(await screen.findByText(/amount is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
