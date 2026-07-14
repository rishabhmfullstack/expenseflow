import { z } from 'zod';

const roleEnum = ['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGER', 'ADMIN'] as const;

export const createAdminUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(roleEnum),
  managerId: z
    .string()
    .uuid('Select a valid assignee')
    .optional()
    .or(z.literal('')),
});

export type CreateAdminUserValues = z.infer<typeof createAdminUserSchema>;

export const defaultCreateAdminUser: CreateAdminUserValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  managerId: '',
};
