'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  adminUsersFilterSchema,
  defaultAdminUsersFilter,
  type AdminUsersFilterValues,
} from '@/schemas/filter.schema';
import type { Role } from '@/types';
import { formatLabel } from '@/lib/utils';
import {
  FormInput,
  FormSelect,
  SearchFiltersPanel,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Form, FormActions, FormGrid } from '@/components/forms/form-layout';

const roleOptions: Role[] = ['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGER', 'ADMIN'];

interface AdminUsersFiltersProps {
  values: AdminUsersFilterValues;
  onApply: (values: AdminUsersFilterValues) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  isSearchPending?: boolean;
}

export function AdminUsersFilters({
  values,
  onApply,
  onSearchChange,
  onReset,
  isSearchPending,
}: AdminUsersFiltersProps) {
  const form = useForm<AdminUsersFilterValues>({
    resolver: zodResolver(adminUsersFilterSchema),
    defaultValues: defaultAdminUsersFilter,
  });

  useEffect(() => {
    form.reset(values);
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

      const parsed = adminUsersFilterSchema.safeParse(current);
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
              <FormInput name="search" label="Search" placeholder="Name or email..." />
              {isSearchPending && (
                <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
            <FormSelect
              name="role"
              label="Role"
              placeholder="All roles"
              options={roleOptions.map((role) => ({ label: formatLabel(role), value: role }))}
            />
            <FormSelect
              name="isActive"
              label="Status"
              placeholder="All users"
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
            />
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
