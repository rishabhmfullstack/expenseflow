import type { ReactNode } from 'react';

jest.mock('@/components/claims/receipt-upload-field', () => ({
  ReceiptUploadField: ({
    value,
    onChange,
    disabled,
  }: {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor="receipt-upload">Receipt</label>
      <input
        id="receipt-upload"
        aria-label="Receipt"
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  ),
}));

jest.mock('@/components/layout/dashboard-shell', () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/claims/approval-history-panel', () => ({
  ApprovalHistoryPanel: () => <div data-testid="approval-history-panel" />,
}));

jest.mock('@/components/claims/claim-row', () => ({
  ClaimRow: ({ claim }: { claim: { description: string } }) => (
    <div data-testid="claim-row">{claim.description}</div>
  ),
}));
