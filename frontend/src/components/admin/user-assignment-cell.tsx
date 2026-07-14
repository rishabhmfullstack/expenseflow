'use client';

import { useEffect, useState } from 'react';
import { Select } from '@/components/ui/input';
import { formatManagerSummary } from '@/lib/user-label';
import type { UserWithManager } from '@/types';

interface UserAssignmentCellProps {
  user: UserWithManager;
  options: Array<{ label: string; value: string }>;
  isPending?: boolean;
  onAssign: (assigneeId: string) => void;
}

export function UserAssignmentCell({
  user,
  options,
  isPending = false,
  onAssign,
}: UserAssignmentCellProps) {
  const [selectedId, setSelectedId] = useState(user.managerId ?? '');

  useEffect(() => {
    setSelectedId(user.managerId ?? '');
  }, [user.managerId]);

  if (user.role !== 'EMPLOYEE' && user.role !== 'MANAGER') {
    return <span className="text-slate-400">—</span>;
  }

  if (!user.isActive) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-slate-700">{formatManagerSummary(user.manager)}</p>
        <p className="text-xs text-slate-400">Inactive user</p>
      </div>
    );
  }

  const label = user.role === 'EMPLOYEE' ? 'Manager' : 'Senior manager';
  const placeholder = user.role === 'EMPLOYEE' ? 'Select manager' : 'Select senior manager';

  return (
    <div className="min-w-[220px] space-y-2">
      <p className="text-xs text-slate-500">
        Current: {formatManagerSummary(user.manager)}
      </p>
      <Select
        value={selectedId}
        disabled={isPending || options.length === 0}
        onChange={(event) => {
          const nextValue = event.target.value;
          setSelectedId(nextValue);

          if (!nextValue || nextValue === user.managerId) {
            return;
          }

          onAssign(nextValue);
        }}
        aria-label={`Assign ${label.toLowerCase()} for ${user.firstName} ${user.lastName}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {options.length === 0 && (
        <p className="text-xs text-amber-600">No active {label.toLowerCase()}s available</p>
      )}
    </div>
  );
}
