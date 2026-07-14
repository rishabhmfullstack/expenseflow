'use client';

import type { PendingClaimsFilterValues } from '@/schemas/filter.schema';
import { ClaimsFiltersPanel } from './claims-filters-panel';

interface PendingClaimsFiltersProps {
  values: PendingClaimsFilterValues;
  onApply: (values: PendingClaimsFilterValues) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  isSearchPending?: boolean;
}

export function PendingClaimsFilters({
  values,
  onApply,
  onSearchChange,
  onReset,
  isSearchPending,
}: PendingClaimsFiltersProps) {
  return (
    <ClaimsFiltersPanel
      values={values}
      onApply={(next) => onApply(next as PendingClaimsFilterValues)}
      onSearchChange={onSearchChange}
      onReset={onReset}
      showStatus={false}
      isSearchPending={isSearchPending}
    />
  );
}
