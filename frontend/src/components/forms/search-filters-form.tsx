'use client';

import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormActions, FormGrid } from './form-layout';

interface SearchFiltersFormProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>;
  onApply: (values: T) => void;
  onReset?: () => void;
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  isLoading?: boolean;
}

export function SearchFiltersForm<T extends Record<string, unknown>>({
  form,
  onApply,
  onReset,
  children,
  cols = 3,
  isLoading,
}: SearchFiltersFormProps<T>) {
  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(onApply)}
        className="space-y-4"
      >
        <FormGrid cols={cols}>{children}</FormGrid>
        <FormActions align="start">
          <Button type="submit" isLoading={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Apply filters
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </FormActions>
      </Form>
    </FormProvider>
  );
}
