'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormValues } from '@/schemas/claim.schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormActions,
  FormTextarea,
} from '@/components/forms';

interface NoteFormModalProps {
  title: string;
  submitLabel: string;
  variant?: 'primary' | 'danger';
  onSubmit: (note: string) => Promise<unknown> | void;
  onCancel: () => void;
}

export function NoteForm({
  title,
  submitLabel,
  variant = 'primary',
  onSubmit,
  onCancel,
}: NoteFormModalProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
    mode: 'onBlur',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <FormProvider {...form}>
          <Form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values.note);
            })}
            className="mt-4"
          >
            <FormTextarea
              name="note"
              label="Note"
              placeholder="Enter a note..."
              rows={4}
              required
            />
            <FormActions>
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                isLoading={form.formState.isSubmitting}
              >
                {submitLabel}
              </Button>
            </FormActions>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}
