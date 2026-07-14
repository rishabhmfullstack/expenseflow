import { z } from 'zod';
import { ClaimStatus, ExpenseCategory } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

const receiptPathSchema = z
  .string()
  .trim()
  .regex(
    /^\/uploads\/receipts\/[\w-]+\.(jpg|jpeg|png|pdf)$/i,
    'Receipt must be an uploaded file path',
  );

export const createClaimSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  receiptUrl: receiptPathSchema.optional(),
  expenseDate: z.coerce.date(),
});

export const updateClaimSchema = createClaimSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const listClaimsQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().trim().min(1).optional(),
    status: z.nativeEnum(ClaimStatus).optional(),
    category: z.nativeEnum(ExpenseCategory).optional(),
    expenseDateFrom: z.coerce.date().optional(),
    expenseDateTo: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.expenseDateFrom && data.expenseDateTo) {
        return data.expenseDateFrom <= data.expenseDateTo;
      }
      return true;
    },
    {
      message: 'expenseDateFrom must be before or equal to expenseDateTo',
      path: ['expenseDateTo'],
    },
  );

export const rejectClaimSchema = z.object({
  note: z.string().min(1),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type ListClaimsQuery = z.infer<typeof listClaimsQuerySchema>;
export type RejectClaimInput = z.infer<typeof rejectClaimSchema>;
