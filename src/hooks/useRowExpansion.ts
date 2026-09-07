'use client';

import { useCallback, useMemo } from 'react';
import { useControllableState } from './useControllableState';
import type { ExpandedState } from '@/components/data-table/types';

const EMPTY_EXPANDED: ExpandedState = {};

export interface UseRowExpansionOptions {
  expanded?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;
}

export interface RowExpansion {
  expanded: ExpandedState;
  isExpanded: (rowId: string) => boolean;
  toggle: (rowId: string) => void;
}

export function useRowExpansion(options: UseRowExpansionOptions = {}): RowExpansion {
  const [expanded, setExpanded] = useControllableState<ExpandedState>({
    value: options.expanded,
    defaultValue: options.defaultExpanded ?? EMPTY_EXPANDED,
    onChange: options.onExpandedChange,
  });

  const toggle = useCallback(
    (rowId: string) => {
      setExpanded((previous) => {
        if (!previous[rowId]) return { ...previous, [rowId]: true };
        const next = { ...previous };
        delete next[rowId];
        return next;
      });
    },
    [setExpanded],
  );

  const isExpanded = useCallback((rowId: string) => expanded[rowId] === true, [expanded]);

  return useMemo(() => ({ expanded, isExpanded, toggle }), [expanded, isExpanded, toggle]);
}
