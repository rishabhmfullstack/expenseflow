import type { User, UserWithManager } from '@/types';

export function formatUserLabel(
  user: Pick<User, 'firstName' | 'lastName' | 'email'>,
): string {
  return `${user.firstName} ${user.lastName} (${user.email})`;
}

export function formatManagerSummary(
  manager: UserWithManager['manager'],
): string {
  if (!manager) {
    return 'Unassigned';
  }

  return `${manager.firstName} ${manager.lastName}`;
}

export function toUserSelectOptions(users: UserWithManager[]) {
  return users.map((user) => ({
    label: formatUserLabel(user),
    value: user.id,
  }));
}
