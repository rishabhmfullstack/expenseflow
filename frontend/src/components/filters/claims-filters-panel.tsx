'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { employeeClaimsFilterSchema } from '@/schemas/filter.schema';
import { EXPENSE_CATEGORIES, type ClaimStatus } from '@/types';
import { formatLabel } from '@/lib/utils';
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  SearchFiltersPanel,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Form, FormActions, FormGrid } from '@/components/forms/form-layout';

interface ClaimsFiltersPanelProps {
  values: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  showStatus?: boolean;
  statusOptions?: ClaimStatus[];
  isSearchPending?: boolean;
}

export function ClaimsFiltersPanel({
  values,
  onApply,
  onSearchChange,
  onReset,
  showStatus = true,
  statusOptions = [],
  isSearchPending,
}: ClaimsFiltersPanelProps) {
  const form = useForm({
    resolver: zodResolver(employeeClaimsFilterSchema),
    defaultValues: {
      search: '',
      status: '',
      category: '',
      expenseDateFrom: '',
      expenseDateTo: '',
      ...values,
    },
  });

  useEffect(() => {
    form.reset({
      search: '',
      status: '',
      category: '',
      expenseDateFrom: '',
      expenseDateTo: '',
      ...values,
    });
  }, [values, form]);

  useEffect(() => {
    const subscription = form.watch((current, { name, type }) => {
      if (type !== 'change' || !name) {
        return;
      }

      if (name === 'search') {
        onSearchChange(String(current.search ?? ''));
        return;
      }

      const parsed = employeeClaimsFilterSchema.safeParse(current);
      if (parsed.success) {
        onApply(parsed.data);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onApply, onSearchChange]);

  const handleReset = () => {
    form.reset();
    onReset();
  };

  return (
    <SearchFiltersPanel className="mb-6">
      <FormProvider {...form}>
        <Form onSubmit={(event) => event.preventDefault()} className="space-y-4">
          <FormGrid cols={3}>
            <div className="relative">
              <FormInput
                name="search"
                label="Search"
                placeholder="Search description..."
              />
              {isSearchPending && (
                <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
            {showStatus && (
              <FormSelect
                name="status"
                label="Status"
                placeholder="All statuses"
                options={statusOptions.map((status) => ({
                  label: formatLabel(status),
                  value: status,
                }))}
              />
            )}
            <FormSelect
              name="category"
              label="Category"
              placeholder="All categories"
              options={EXPENSE_CATEGORIES.map((category) => ({
                label: formatLabel(category),
                value: category,
              }))}
            />
            <FormDatePicker name="expenseDateFrom" label="From date" />
            <FormDatePicker name="expenseDateTo" label="To date" />
          </FormGrid>
          <FormActions align="start">
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset filters
            </Button>
          </FormActions>
        </Form>
      </FormProvider>
    </SearchFiltersPanel>
  );
}
