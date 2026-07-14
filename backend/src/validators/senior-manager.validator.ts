import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const seniorManagerApproveSchema = z.object({
  note: z.string().trim().max(2000).optional(),
});

export const seniorManagerNoteSchema = z.object({
  note: z.string().trim().min(1, 'Note is required').max(2000),
});

export const listPendingSeniorManagerClaimsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  expenseDateFrom: z.coerce.date().optional(),
  expenseDateTo: z.coerce.date().optional(),
}).refine(
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

export type SeniorManagerApproveInput = z.infer<typeof seniorManagerApproveSchema>;
export type SeniorManagerNoteInput = z.infer<typeof seniorManagerNoteSchema>;
export type ListPendingSeniorManagerClaimsQuery = z.infer<
  typeof listPendingSeniorManagerClaimsQuerySchema
>;
