'use client';

import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAdminUserSchema,
  defaultCreateAdminUser,
  type CreateAdminUserValues,
} from '@/schemas/admin.schema';
import type { Role, UserWithManager } from '@/types';
import { formatLabel } from '@/lib/utils';
import { toUserSelectOptions } from '@/lib/user-label';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormActions,
  FormGrid,
  FormInput,
  FormSelect,
} from '@/components/forms';

const roleOptions: Role[] = ['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGER', 'ADMIN'];

interface CreateUserFormProps {
  managers: UserWithManager[];
  seniorManagers: UserWithManager[];
  onSubmit: (values: CreateAdminUserValues) => Promise<void>;
  onCancel: () => void;
  serverError?: string | null;
}

export function CreateUserForm({
  managers,
  seniorManagers,
  onSubmit,
  onCancel,
  serverError,
}: CreateUserFormProps) {
  const form = useForm<CreateAdminUserValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: defaultCreateAdminUser,
    mode: 'onBlur',
  });

  const role = form.watch('role');

  useEffect(() => {
    form.setValue('managerId', '');
  }, [role, form]);

  const managerOptions = toUserSelectOptions(managers);
  const seniorManagerOptions = toUserSelectOptions(seniorManagers);

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormGrid cols={2}>
          <FormInput name="firstName" label="First name" required />
          <FormInput name="lastName" label="Last name" required />
          <FormInput name="email" label="Email" type="email" required />
          <FormInput
            name="password"
            label="Password"
            type="password"
            hint="Min 8 characters"
            required
          />
          <FormSelect
            name="role"
            label="Role"
            placeholder="Select role"
            options={roleOptions.map((item) => ({ label: formatLabel(item), value: item }))}
            required
          />
          {role === 'EMPLOYEE' && (
            <FormSelect
              name="managerId"
              label="Manager"
              placeholder="Select manager (optional)"
              hint="Only active managers are listed"
              options={managerOptions}
            />
          )}
          {role === 'MANAGER' && (
            <FormSelect
              name="managerId"
              label="Senior manager"
              placeholder="Select senior manager (optional)"
              hint="Only active senior managers are listed"
              options={seniorManagerOptions}
            />
          )}
        </FormGrid>
        {serverError && (
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
        )}
        <FormActions>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={form.formState.isSubmitting}>
            Create user
          </Button>
        </FormActions>
      </Form>
    </FormProvider>
  );
}
