'use client';

import { useCallback, useMemo } from 'react';
import { useControllableState } from './useControllableState';
import type { SortState } from '@/components/data-table/types';

export interface UseSortingOptions {
  sortState?: SortState;
  defaultSortState?: SortState;
  onSortChange?: (next: SortState) => void;
}

export interface Sorting {
  sortState: SortState;
  setSortState: (next: SortState) => void;
  toggleSort: (columnKey: string) => void;
}

export function useSorting(options: UseSortingOptions = {}): Sorting {
  const [sortState, setSortState] = useControllableState<SortState>({
    value: options.sortState,
    defaultValue: options.defaultSortState ?? null,
    onChange: options.onSortChange,
  });

  const toggleSort = useCallback(
    (columnKey: string) => {
      setSortState((previous) => {
        if (!previous || previous.columnKey !== columnKey) return { columnKey, direction: 'asc' };
        if (previous.direction === 'asc') return { columnKey, direction: 'desc' };
        return null;
      });
    },
    [setSortState],
  );

  return useMemo(
    () => ({ sortState, setSortState, toggleSort }),
    [sortState, setSortState, toggleSort],
  );
}
