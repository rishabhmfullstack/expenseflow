'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DataTable, PageHeader, QueryListPanel } from '@/components/common';
import { AdminUsersFilters } from '@/components/filters/admin-users-filters';
import { CreateUserForm } from '@/components/admin/create-user-form';
import { UserAssignmentCell } from '@/components/admin/user-assignment-cell';
import { RoleBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormCard } from '@/components/forms';
import { adminService } from '@/services/admin.service';
import { getApiErrorMessage } from '@/lib/api';
import { formatManagerSummary, toUserSelectOptions } from '@/lib/user-label';
import { useAdminAssignees } from '@/hooks/use-admin-assignees';
import { useUserAssignment } from '@/hooks/use-user-assignment';
import { usePaginatedFilters } from '@/hooks/use-paginated-filters';
import {
  defaultAdminUsersFilter,
  type AdminUsersFilterValues,
} from '@/schemas/filter.schema';
import type { CreateAdminUserValues } from '@/schemas/admin.schema';
import { isDefaultPageQuery } from '@/lib/react-query/initial-data';
import type { PaginationMeta, Role, UserWithManager } from '@/types';

const PAGE_SIZE = 10;

export function AdminUsersContent({
  initialData,
}: {
  initialData?: { users: UserWithManager[]; meta: PaginationMeta } | null;
}) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { managers, seniorManagers, isLoading: assigneesLoading } = useAdminAssignees();
  const { assignEmployeeMutation, assignManagerMutation, isAssigning } = useUserAssignment();

  const {
    page,
    setPage,
    filters,
    queryFilters,
    applyFilters,
    resetFilters,
    updateSearch,
    isSearchPending,
  } = usePaginatedFilters<AdminUsersFilterValues>({
    defaults: defaultAdminUsersFilter,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'users', { page, filters: queryFilters }],
    queryFn: () =>
      adminService.listUsers({
        page,
        limit: PAGE_SIZE,
        search: queryFilters.search || undefined,
        role: (queryFilters.role as Role) || undefined,
        isActive:
          queryFilters.isActive === 'true'
            ? true
            : queryFilters.isActive === 'false'
              ? false
              : undefined,
      }),
    initialData:
      isDefaultPageQuery(page, queryFilters, defaultAdminUsersFilter) && initialData
        ? initialData
        : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateAdminUserValues) =>
      adminService.createUser({
        ...values,
        managerId: values.managerId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignees'] });
      setShowCreate(false);
      setCreateError(null);
    },
    onError: (err) => setCreateError(getApiErrorMessage(err)),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignees'] });
    },
  });

  const managerOptions = useMemo(() => toUserSelectOptions(managers), [managers]);
  const seniorManagerOptions = useMemo(
    () => toUserSelectOptions(seniorManagers),
    [seniorManagers],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (user: UserWithManager) => `${user.firstName} ${user.lastName}`,
      },
      {
        key: 'email',
        header: 'Email',
        className: 'text-slate-600',
        render: (user: UserWithManager) => user.email,
      },
      {
        key: 'role',
        header: 'Role',
        render: (user: UserWithManager) => <RoleBadge role={user.role} />,
      },
      {
        key: 'reportsTo',
        header: 'Reports to',
        render: (user: UserWithManager) => {
          if (user.role === 'EMPLOYEE' || user.role === 'MANAGER') {
            return (
              <span className="text-sm text-slate-700">{formatManagerSummary(user.manager)}</span>
            );
          }

          return <span className="text-slate-400">—</span>;
        },
      },
      {
        key: 'assignment',
        header: 'Assign / reassign',
        render: (user: UserWithManager) => {
          if (user.role === 'EMPLOYEE') {
            return (
              <UserAssignmentCell
                user={user}
                options={managerOptions}
                isPending={isAssigning || assigneesLoading}
                onAssign={(managerId) =>
                  assignEmployeeMutation.mutate({ employeeId: user.id, managerId })
                }
              />
            );
          }

          if (user.role === 'MANAGER') {
            return (
              <UserAssignmentCell
                user={user}
                options={seniorManagerOptions}
                isPending={isAssigning || assigneesLoading}
                onAssign={(seniorManagerId) =>
                  assignManagerMutation.mutate({ managerId: user.id, seniorManagerId })
                }
              />
            );
          }

          return <span className="text-slate-400">—</span>;
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (user: UserWithManager) => (user.isActive ? 'Active' : 'Inactive'),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (user: UserWithManager) =>
          user.isActive ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => deactivateMutation.mutate(user.id)}
              isLoading={deactivateMutation.isPending}
            >
              Deactivate
            </Button>
          ) : (
            '—'
          ),
      },
    ],
    [
      assigneesLoading,
      assignEmployeeMutation,
      assignManagerMutation,
      deactivateMutation,
      isAssigning,
      managerOptions,
      seniorManagerOptions,
    ],
  );

  return (
    <DashboardShell allowedRoles={['ADMIN']}>
      <PageHeader
        title="Users"
        description="Manage users and reporting relationships"
        action={<Button onClick={() => setShowCreate(!showCreate)}>Add user</Button>}
      />

      {showCreate && (
        <FormCard title="Create user" className="mb-6 max-w-2xl">
          <CreateUserForm
            managers={managers}
            seniorManagers={seniorManagers}
            serverError={createError}
            onCancel={() => {
              setShowCreate(false);
              setCreateError(null);
            }}
            onSubmit={async (values) => {
              setCreateError(null);
              try {
                await createMutation.mutateAsync(values);
              } catch {
                // Error surfaced via createError state.
              }
            }}
          />
        </FormCard>
      )}

      <AdminUsersFilters
        values={filters}
        onApply={applyFilters}
        onSearchChange={updateSearch}
        onReset={resetFilters}
        isSearchPending={isSearchPending || isFetching}
      />

      <QueryListPanel
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data?.users.length}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filter criteria."
        skeleton="table"
        skeletonColumns={7}
        pagination={
          data
            ? {
                page,
                totalPages: data.meta.totalPages,
                total: data.meta.total,
                limit: PAGE_SIZE,
                onPageChange: setPage,
                isLoading: isFetching,
              }
            : undefined
        }
      >
        {data && (
          <DataTable columns={columns} data={data.users} keyExtractor={(user) => user.id} />
        )}
      </QueryListPanel>
    </DashboardShell>
  );
}
