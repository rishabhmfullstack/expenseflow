'use client';

import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  defaultSignupValues,
  signupSchema,
  type SignupFormValues,
} from '@/schemas/auth.schema';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormActions,
  FormCard,
  FormError,
  FormGrid,
  FormInput,
} from '@/components/forms';

export function SignupForm() {
  const { signup, signupError } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: defaultSignupValues,
    mode: 'onBlur',
  });

  return (
    <FormCard title="Create your account" className="w-full max-w-md">
      <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((values) => signup(values))}>
          <FormGrid cols={2}>
            <FormInput name="firstName" label="First name" autoComplete="given-name" required />
            <FormInput name="lastName" label="Last name" autoComplete="family-name" required />
          </FormGrid>
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
            autoComplete="new-password"
            hint="Minimum 8 characters"
            required
          />
          <FormError message={signupError ?? undefined} />
          <FormActions className="flex-col sm:flex-col">
            <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
              Create account
            </Button>
          </FormActions>
        </Form>
      </FormProvider>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </FormCard>
  );
}
