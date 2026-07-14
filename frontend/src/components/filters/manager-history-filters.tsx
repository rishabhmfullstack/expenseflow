'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  defaultManagerHistoryFilter,
  managerHistoryFilterSchema,
  type ManagerHistoryFilterValues,
} from '@/schemas/filter.schema';
import { MANAGER_HISTORY_STATUS_OPTIONS } from '@/types';
import { formatLabel } from '@/lib/utils';
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  SearchFiltersPanel,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Form, FormActions, FormGrid } from '@/components/forms/form-layout';

interface ManagerHistoryFiltersProps {
  values: ManagerHistoryFilterValues;
  onApply: (values: ManagerHistoryFilterValues) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  isSearchPending?: boolean;
}

export function ManagerHistoryFilters({
  values,
  onApply,
  onSearchChange,
  onReset,
  isSearchPending,
}: ManagerHistoryFiltersProps) {
  const form = useForm<ManagerHistoryFilterValues>({
    resolver: zodResolver(managerHistoryFilterSchema),
    defaultValues: defaultManagerHistoryFilter,
  });

  useEffect(() => {
    form.reset({ ...defaultManagerHistoryFilter, ...values });
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

      const parsed = managerHistoryFilterSchema.safeParse(current);
      if (parsed.success) {
        onApply(parsed.data);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onApply, onSearchChange]);

  return (
    <SearchFiltersPanel className="mb-6">
      <FormProvider {...form}>
        <Form onSubmit={(event) => event.preventDefault()} className="space-y-4">
          <FormGrid cols={3}>
            <div className="relative">
              <FormInput
                name="search"
                label="Search"
                placeholder="Employee, email, or claim description..."
              />
              {isSearchPending && (
                <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
            <FormSelect
              name="status"
              label="Result status"
              placeholder="All statuses"
              options={MANAGER_HISTORY_STATUS_OPTIONS.map((status) => ({
                label: formatLabel(status),
                value: status,
              }))}
            />
            <FormDatePicker name="actionDateFrom" label="Action from" />
            <FormDatePicker name="actionDateTo" label="Action to" />
          </FormGrid>
          <FormActions align="start">
            <Button type="button" variant="secondary" onClick={onReset}>
              Reset filters
            </Button>
          </FormActions>
        </Form>
      </FormProvider>
    </SearchFiltersPanel>
  );
}
