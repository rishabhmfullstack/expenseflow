import { z } from 'zod';
import { ClaimStatus, ExpenseCategory, Role } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const createAdminUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.nativeEnum(Role),
  managerId: z.string().uuid().nullable().optional(),
});

export const updateAdminUserSchema = z.object({
  email: z.string().email().max(255).optional(),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  role: z.nativeEnum(Role).optional(),
  managerId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const assignToManagerSchema = z.object({
  managerId: z.string().uuid(),
});

export const assignToSeniorManagerSchema = z.object({
  seniorManagerId: z.string().uuid(),
});

export const listAdminUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const listAdminClaimsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ClaimStatus).optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  employeeId: z.string().uuid().optional(),
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

export const monthlySummaryQuerySchema = paginationQuerySchema.extend({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type AssignToManagerInput = z.infer<typeof assignToManagerSchema>;
export type AssignToSeniorManagerInput = z.infer<typeof assignToSeniorManagerSchema>;
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
export type ListAdminClaimsQuery = z.infer<typeof listAdminClaimsQuerySchema>;
export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;
