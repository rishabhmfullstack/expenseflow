import { z } from 'zod';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types';

const categoryEnum = EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]];

export const claimSchema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be greater than zero'),
  category: z.enum(categoryEnum, { error: 'Category is required' }),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  receiptUrl: z
    .string()
    .trim()
    .regex(
      /^\/uploads\/receipts\/[\w-]+\.(jpg|jpeg|png|pdf)$/i,
      'Upload a valid receipt file',
    )
    .optional()
    .or(z.literal('')),
  expenseDate: z.string().min(1, 'Expense date is required'),
});

export type ClaimFormValues = z.infer<typeof claimSchema>;

export const noteSchema = z.object({
  note: z.string().trim().min(1, 'Note is required').max(2000),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export function getDefaultClaimValues(): Partial<ClaimFormValues> {
  return {
    category: 'TRAVEL',
    description: '',
    receiptUrl: '',
    expenseDate: new Date().toISOString().split('T')[0],
  };
}
