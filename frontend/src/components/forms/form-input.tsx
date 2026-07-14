'use client';

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from './form-field';

export interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  valueAsNumber?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = 'text',
  hint,
  placeholder,
  required,
  disabled,
  autoComplete,
  valueAsNumber,
  min,
  max,
  step,
  className,
}: FormInputProps<T>) {
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
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            hasError={!!fieldState.error}
            min={min}
            max={max}
            step={step}
            value={field.value ?? ''}
            onChange={(e) => {
              const value = valueAsNumber ? e.target.valueAsNumber : e.target.value;
              field.onChange(Number.isNaN(value) ? '' : value);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormField>
      )}
    />
  );
}
