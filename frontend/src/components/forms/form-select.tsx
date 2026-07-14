'use client';

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form';
import { Select } from '@/components/ui/input';
import { FormField } from './form-field';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Select an option',
  hint,
  required,
  disabled,
  className,
}: FormSelectProps<T>) {
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
          <Select
            id={String(name)}
            disabled={disabled}
            hasError={!!fieldState.error}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      )}
    />
  );
}
