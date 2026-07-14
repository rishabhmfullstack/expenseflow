import { cn, formatLabel, getStatusColor } from '@/lib/utils';
import type { ClaimStatus, Role } from '@/types';

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusColor(status),
      )}
    >
      {formatLabel(status)}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    EMPLOYEE: 'bg-slate-100 text-slate-700',
    MANAGER: 'bg-blue-100 text-blue-800',
    SENIOR_MANAGER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', colors[role])}>
      {formatLabel(role)}
    </span>
  );
}
