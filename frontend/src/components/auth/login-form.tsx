'use client';

import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  defaultLoginValues,
  loginSchema,
  type LoginFormValues,
} from '@/schemas/auth.schema';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormActions,
  FormCard,
  FormError,
  FormInput,
} from '@/components/forms';

export function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: 'onBlur',
  });

  return (
    <FormCard title="Sign in to ExpenseFlow" className="w-full max-w-md">
      <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((values) => login(values))}>
          <FormInput
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
          <FormInput
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
          />
          <FormError message={loginError ?? undefined} />
          <FormActions className="flex-col sm:flex-col">
            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
              Sign in
            </Button>
          </FormActions>
        </Form>
      </FormProvider>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{' '}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign up
        </Link>
      </p>
    </FormCard>
  );
}
