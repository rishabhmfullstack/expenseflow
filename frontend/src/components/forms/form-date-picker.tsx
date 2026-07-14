'use client';

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from './form-field';

export interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  label,
  hint,
  required,
  disabled,
  min,
  max,
  className,
}: FormDatePickerProps<T>) {
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
          <Input
            id={String(name)}
            type="date"
            disabled={disabled}
            hasError={!!fieldState.error}
            min={min}
            max={max}
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
