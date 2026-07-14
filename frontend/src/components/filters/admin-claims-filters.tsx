'use client';

import type { AdminClaimsFilterValues } from '@/schemas/filter.schema';
import type { ClaimStatus } from '@/types';
import { ClaimsFiltersPanel } from './claims-filters-panel';

const statusOptions: ClaimStatus[] = [
  'DRAFT',
  'PENDING_MANAGER',
  'PENDING_SENIOR_MANAGER',
  'APPROVED',
  'REJECTED',
  'REVERTED_TO_EMPLOYEE',
  'REVERTED_TO_MANAGER',
];

interface AdminClaimsFiltersProps {
  values: AdminClaimsFilterValues;
  onApply: (values: AdminClaimsFilterValues) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  isSearchPending?: boolean;
}

export function AdminClaimsFilters({
  values,
  onApply,
  onSearchChange,
  onReset,
  isSearchPending,
}: AdminClaimsFiltersProps) {
  return (
    <ClaimsFiltersPanel
      values={values}
      onApply={(next) => onApply(next as AdminClaimsFilterValues)}
      onSearchChange={onSearchChange}
      onReset={onReset}
      statusOptions={statusOptions}
      isSearchPending={isSearchPending}
    />
  );
}
