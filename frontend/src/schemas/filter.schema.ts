import { z } from 'zod';

export const employeeClaimsFilterSchema = z
  .object({
    search: z.string(),
    status: z.string(),
    category: z.string(),
    expenseDateFrom: z.string(),
    expenseDateTo: z.string(),
  })
  .refine(
    (data) => {
      if (data.expenseDateFrom && data.expenseDateTo) {
        return data.expenseDateFrom <= data.expenseDateTo;
      }
      return true;
    },
    { message: 'Start date must be before end date', path: ['expenseDateTo'] },
  );

export const adminClaimsFilterSchema = employeeClaimsFilterSchema;

export const adminUsersFilterSchema = z.object({
  search: z.string(),
  role: z.string(),
  isActive: z.string(),
});

export const monthlySummaryFilterSchema = z.object({
  year: z
    .string()
    .refine((val) => !val || (/^\d{4}$/.test(val) && Number(val) >= 2000 && Number(val) <= 2100), {
      message: 'Enter a valid 4-digit year',
    }),
});

export type EmployeeClaimsFilterValues = z.infer<typeof employeeClaimsFilterSchema>;
export type AdminClaimsFilterValues = z.infer<typeof adminClaimsFilterSchema>;
export type AdminUsersFilterValues = z.infer<typeof adminUsersFilterSchema>;
export type MonthlySummaryFilterValues = z.infer<typeof monthlySummaryFilterSchema>;

export const pendingClaimsFilterSchema = z
  .object({
    search: z.string(),
    category: z.string(),
    expenseDateFrom: z.string(),
    expenseDateTo: z.string(),
  })
  .refine(
    (data) => {
      if (data.expenseDateFrom && data.expenseDateTo) {
        return data.expenseDateFrom <= data.expenseDateTo;
      }
      return true;
    },
    { message: 'Start date must be before end date', path: ['expenseDateTo'] },
  );

export type PendingClaimsFilterValues = z.infer<typeof pendingClaimsFilterSchema>;

export const defaultPendingClaimsFilter: PendingClaimsFilterValues = {
  search: '',
  category: '',
  expenseDateFrom: '',
  expenseDateTo: '',
};

export const defaultEmployeeClaimsFilter: EmployeeClaimsFilterValues = {
  search: '',
  status: '',
  category: '',
  expenseDateFrom: '',
  expenseDateTo: '',
};

export const defaultAdminClaimsFilter: AdminClaimsFilterValues = { ...defaultEmployeeClaimsFilter };

export const defaultAdminUsersFilter: AdminUsersFilterValues = {
  search: '',
  role: '',
  isActive: '',
};

export const defaultMonthlySummaryFilter: MonthlySummaryFilterValues = {
  year: '',
};

export const managerHistoryFilterSchema = z
  .object({
    search: z.string(),
    status: z.string(),
    actionDateFrom: z.string(),
    actionDateTo: z.string(),
  })
  .refine(
    (data) => {
      if (data.actionDateFrom && data.actionDateTo) {
        return data.actionDateFrom <= data.actionDateTo;
      }
      return true;
    },
    { message: 'Start date must be before end date', path: ['actionDateTo'] },
  );

export type ManagerHistoryFilterValues = z.infer<typeof managerHistoryFilterSchema>;

export const defaultManagerHistoryFilter: ManagerHistoryFilterValues = {
  search: '',
  status: '',
  actionDateFrom: '',
  actionDateTo: '',
};
