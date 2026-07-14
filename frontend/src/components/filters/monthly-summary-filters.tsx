'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  monthlySummaryFilterSchema,
  defaultMonthlySummaryFilter,
  type MonthlySummaryFilterValues,
} from '@/schemas/filter.schema';
import { FormInput, SearchFiltersPanel } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Form, FormActions } from '@/components/forms/form-layout';

interface MonthlySummaryFiltersProps {
  values: MonthlySummaryFilterValues;
  onYearChange: (year: string) => void;
  onReset: () => void;
  isYearPending?: boolean;
}

export function MonthlySummaryFilters({
  values,
  onYearChange,
  onReset,
  isYearPending,
}: MonthlySummaryFiltersProps) {
  const form = useForm<MonthlySummaryFilterValues>({
    resolver: zodResolver(monthlySummaryFilterSchema),
    defaultValues: defaultMonthlySummaryFilter,
  });

  useEffect(() => {
    form.reset(values);
  }, [values, form]);

  useEffect(() => {
    const subscription = form.watch((current, { name, type }) => {
      if (type !== 'change' || name !== 'year') {
        return;
      }

      onYearChange(String(current.year ?? ''));
    });

    return () => subscription.unsubscribe();
  }, [form, onYearChange]);

  const handleReset = () => {
    form.reset();
    onReset();
  };

  return (
    <SearchFiltersPanel className="mb-6 max-w-md">
      <FormProvider {...form}>
        <Form onSubmit={(event) => event.preventDefault()} className="space-y-4">
          <div className="relative">
            <FormInput
              name="year"
              label="Year"
              type="number"
              placeholder="e.g. 2026"
              hint="Leave empty for all years"
              min={2000}
              max={2100}
            />
            {isYearPending && (
              <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
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
