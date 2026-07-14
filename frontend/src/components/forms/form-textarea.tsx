'use client';

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form';
import { Textarea } from '@/components/ui/input';
import { FormField } from './form-field';

export interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  hint,
  placeholder,
  required,
  disabled,
  rows = 3,
  className,
}: FormTextareaProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={String(name)}
          error={fieldState.error?.message}
          hint={hint}
          required={required}
          className={className}
        >
          <Textarea
            id={String(name)}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!fieldState.error}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormField>
      )}
    />
  );
}
