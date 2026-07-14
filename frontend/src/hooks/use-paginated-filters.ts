'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from './use-debounced-value';

interface UsePaginatedFiltersOptions<T extends { search?: string }> {
  defaults: T;
  debounceMs?: number;
}

export function usePaginatedFilters<T extends { search?: string }>({
  defaults,
  debounceMs = 400,
}: UsePaginatedFiltersOptions<T>) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<T>(defaults);

  const debouncedSearch = useDebouncedValue(filters.search ?? '', debounceMs);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const applyFilters = useCallback((values: T) => {
    setFilters(values);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaults);
    setPage(1);
  }, [defaults]);

  const updateSearch = useCallback((search: string) => {
    setFilters((current) => ({ ...current, search }));
  }, []);

  const isSearchPending = (filters.search ?? '') !== debouncedSearch;

  return {
    page,
    setPage,
    filters,
    queryFilters,
    applyFilters,
    resetFilters,
    updateSearch,
    isSearchPending,
  };
}
