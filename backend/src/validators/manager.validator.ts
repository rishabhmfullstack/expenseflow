import { z } from 'zod';
import { ClaimStatus, ExpenseCategory } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const managerApproveSchema = z.object({
  note: z.string().trim().max(2000).optional(),
});

export const managerNoteSchema = z.object({
  note: z.string().trim().min(1, 'Note is required').max(2000),
});

export const listPendingManagerClaimsQuerySchema = paginationQuerySchema.extend({
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

export type ManagerApproveInput = z.infer<typeof managerApproveSchema>;
export type ManagerNoteInput = z.infer<typeof managerNoteSchema>;
export type ListPendingManagerClaimsQuery = z.infer<typeof listPendingManagerClaimsQuerySchema>;

export const listManagerHistoryQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().trim().min(1).optional(),
    status: z.nativeEnum(ClaimStatus).optional(),
    actionDateFrom: z.coerce.date().optional(),
    actionDateTo: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.actionDateFrom && data.actionDateTo) {
        return data.actionDateFrom <= data.actionDateTo;
      }
      return true;
    },
    {
      message: 'actionDateFrom must be before or equal to actionDateTo',
      path: ['actionDateTo'],
    },
  );

export type ListManagerHistoryQuery = z.infer<typeof listManagerHistoryQuerySchema>;
