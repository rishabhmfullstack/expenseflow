import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2',
        hasError
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20',
        props.disabled && 'cursor-not-allowed bg-slate-50 text-slate-500',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)} {...props} />
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2',
        hasError
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20',
        props.disabled && 'cursor-not-allowed bg-slate-50 text-slate-500',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2',
        hasError
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20',
        props.disabled && 'cursor-not-allowed bg-slate-50 text-slate-500',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
