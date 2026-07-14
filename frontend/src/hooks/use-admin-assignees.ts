'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

const ASSIGNEE_PAGE_SIZE = 100;

export function useAdminAssignees() {
  const managersQuery = useQuery({
    queryKey: ['admin', 'assignees', 'managers'],
    queryFn: () =>
      adminService.listUsers({
        role: 'MANAGER',
        isActive: true,
        page: 1,
        limit: ASSIGNEE_PAGE_SIZE,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const seniorManagersQuery = useQuery({
    queryKey: ['admin', 'assignees', 'senior-managers'],
    queryFn: () =>
      adminService.listUsers({
        role: 'SENIOR_MANAGER',
        isActive: true,
        page: 1,
        limit: ASSIGNEE_PAGE_SIZE,
      }),
    staleTime: 5 * 60 * 1000,
  });

  return {
    managers: managersQuery.data?.users ?? [],
    seniorManagers: seniorManagersQuery.data?.users ?? [],
    isLoading: managersQuery.isLoading || seniorManagersQuery.isLoading,
    isError: managersQuery.isError || seniorManagersQuery.isError,
    refetch: () => Promise.all([managersQuery.refetch(), seniorManagersQuery.refetch()]),
  };
}
