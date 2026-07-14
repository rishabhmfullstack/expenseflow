'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { adminService } from '@/services/admin.service';
import type { PaginationMeta, UserWithManager } from '@/types';

interface AdminUsersListData {
  users: UserWithManager[];
  meta: PaginationMeta;
}

function updateUserInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  updatedUser: UserWithManager,
) {
  queryClient.setQueriesData<AdminUsersListData>({ queryKey: ['admin', 'users'] }, (current) => {
    if (!current?.users) {
      return current;
    }

    return {
      ...current,
      users: current.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    };
  });
}

export function useUserAssignment() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const assignEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, managerId }: { employeeId: string; managerId: string }) =>
      adminService.assignToManager(employeeId, managerId),
    onMutate: async ({ employeeId, managerId }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'users'] });

      const previousLists = queryClient.getQueriesData<AdminUsersListData>({
        queryKey: ['admin', 'users'],
      });

      const managers =
        queryClient.getQueryData<AdminUsersListData>(['admin', 'assignees', 'managers'])?.users ??
        [];
      const manager = managers.find((item) => item.id === managerId) ?? null;

      previousLists.forEach(([queryKey, data]) => {
        if (!data?.users) {
          return;
        }

        queryClient.setQueryData<AdminUsersListData>(queryKey, {
          ...data,
          users: data.users.map((user) =>
            user.id === employeeId
              ? {
                  ...user,
                  managerId,
                  manager: manager
                    ? {
                        id: manager.id,
                        firstName: manager.firstName,
                        lastName: manager.lastName,
                        email: manager.email,
                        role: manager.role,
                      }
                    : null,
                }
              : user,
          ),
        });
      });

      return { previousLists };
    },
    onError: (error, _, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(getApiErrorMessage(error, 'Failed to assign manager'));
    },
    onSuccess: (updatedUser) => {
      updateUserInLists(queryClient, updatedUser);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Employee assigned to manager');
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: ({
      managerId,
      seniorManagerId,
    }: {
      managerId: string;
      seniorManagerId: string;
    }) => adminService.assignToSeniorManager(managerId, seniorManagerId),
    onMutate: async ({ managerId, seniorManagerId }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'users'] });

      const previousLists = queryClient.getQueriesData<AdminUsersListData>({
        queryKey: ['admin', 'users'],
      });

      const seniorManagers =
        queryClient.getQueryData<AdminUsersListData>([
          'admin',
          'assignees',
          'senior-managers',
        ])?.users ?? [];
      const seniorManager = seniorManagers.find((item) => item.id === seniorManagerId) ?? null;

      previousLists.forEach(([queryKey, data]) => {
        if (!data?.users) {
          return;
        }

        queryClient.setQueryData<AdminUsersListData>(queryKey, {
          ...data,
          users: data.users.map((user) =>
            user.id === managerId
              ? {
                  ...user,
                  managerId: seniorManagerId,
                  manager: seniorManager
                    ? {
                        id: seniorManager.id,
                        firstName: seniorManager.firstName,
                        lastName: seniorManager.lastName,
                        email: seniorManager.email,
                        role: seniorManager.role,
                      }
                    : null,
                }
              : user,
          ),
        });
      });

      return { previousLists };
    },
    onError: (error, _, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(getApiErrorMessage(error, 'Failed to assign senior manager'));
    },
    onSuccess: (updatedUser) => {
      updateUserInLists(queryClient, updatedUser);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Manager assigned to senior manager');
    },
  });

  return {
    assignEmployeeMutation,
    assignManagerMutation,
    isAssigning:
      assignEmployeeMutation.isPending || assignManagerMutation.isPending,
  };
}
