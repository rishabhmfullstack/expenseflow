'use client';

import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  claimSchema,
  getDefaultClaimValues,
  type ClaimFormValues,
} from '@/schemas/claim.schema';
import { EXPENSE_CATEGORIES } from '@/types';
import { ReceiptUploadField } from '@/components/claims/receipt-upload-field';
import { Button } from '@/components/ui/button';
import { formatLabel } from '@/lib/utils';
import {
  Form,
  FormActions,
  FormGrid,
  FormInput,
  FormSelect,
  FormDatePicker,
  FormTextarea,
} from '@/components/forms';

interface ExpenseFormProps {
  defaultValues?: Partial<ClaimFormValues>;
  onSubmit: (values: ClaimFormValues) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
}

const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
  label: formatLabel(cat),
  value: cat,
}));

export function ExpenseForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save claim',
  disabled,
}: ExpenseFormProps) {
  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      ...getDefaultClaimValues(),
      ...defaultValues,
    } as ClaimFormValues,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormGrid cols={2}>
          <FormInput
            name="amount"
            label="Amount"
            type="number"
            step="0.01"
            min={0}
            valueAsNumber
            placeholder="0.00"
            required
            disabled={disabled}
          />
          <FormSelect
            name="category"
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
            required
            disabled={disabled}
          />
        </FormGrid>

        <FormDatePicker
          name="expenseDate"
          label="Expense date"
          required
          disabled={disabled}
        />

        <FormTextarea
          name="description"
          label="Description"
          placeholder="Describe the expense..."
          rows={3}
          required
          disabled={disabled}
        />

        <Controller
          name="receiptUrl"
          control={form.control}
          render={({ field }) => (
            <ReceiptUploadField
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
            />
          )}
        />

        {!disabled && (
          <FormActions>
            <Button type="submit" isLoading={form.formState.isSubmitting}>
              {submitLabel}
            </Button>
          </FormActions>
        )}
      </Form>
    </FormProvider>
  );
}

export { isClaimEditable } from '@/lib/claim-status';

// Backward-compatible alias
export const ClaimForm = ExpenseForm;
