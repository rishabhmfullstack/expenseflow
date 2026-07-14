'use client';

import type { EmployeeClaimsFilterValues } from '@/schemas/filter.schema';
import type { ClaimStatus } from '@/types';
import { ClaimsFiltersPanel } from './claims-filters-panel';

const statusOptions: ClaimStatus[] = [
  'DRAFT',
  'REVERTED_TO_EMPLOYEE',
  'PENDING_MANAGER',
  'PENDING_SENIOR_MANAGER',
  'APPROVED',
  'REJECTED',
];

interface EmployeeClaimsFiltersProps {
  values: EmployeeClaimsFilterValues;
  onApply: (values: EmployeeClaimsFilterValues) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  isSearchPending?: boolean;
}

export function EmployeeClaimsFilters({
  values,
  onApply,
  onSearchChange,
  onReset,
  isSearchPending,
}: EmployeeClaimsFiltersProps) {
  return (
    <ClaimsFiltersPanel
      values={values}
      onApply={(next) => onApply(next as EmployeeClaimsFilterValues)}
      onSearchChange={onSearchChange}
      onReset={onReset}
      statusOptions={statusOptions}
      isSearchPending={isSearchPending}
    />
  );
}
