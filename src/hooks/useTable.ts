'use client';

import { useCallback, useMemo } from 'react';
import { useSorting, type Sorting } from './useSorting';
import { usePagination, type Pagination } from './usePagination';
import { useRowExpansion, type RowExpansion } from './useRowExpansion';
import { compareSortValues, type SortValue } from '@/utils/compare';
import type { ColumnDef, ResolvedColumn, TableOptions } from '@/components/data-table/types';

import {
  EXPANDER_COLUMN_KEY,
  EXPANDER_WIDTH,
  FALLBACK_PINNED_WIDTH,
} from '@/constants/table';

export interface RenderRow<T> {
  id: string;
  data: T;
  canExpand: boolean;
  isExpanded: boolean;
}

export interface Table<T> {
  rows: RenderRow<T>[];
  columns: ResolvedColumn<T>[];
  sorting: Sorting;
  pagination: Pagination;
  expansion: RowExpansion;
  hasExpansion: boolean;
  isSortable: (column: ResolvedColumn<T>) => boolean;
  totalCount: number;
}

function defaultRowId<T>(row: T, index: number): string {
  const candidate = (row as { id?: unknown }).id;
  return candidate === undefined || candidate === null ? String(index) : String(candidate);
}

function readValue<T>(row: T, key: string): SortValue {
  return (row as Record<string, unknown>)[key] as SortValue;
}

function warnOnce(message: string): void {
  if (process.env.NODE_ENV === 'production') return;
  console.warn(`[DataTable] ${message}`);
}

export function useTable<T>(options: TableOptions<T>): Table<T> {
  const {
    data,
    columns,
    getRowId = defaultRowId,
    manualSorting = false,
    manualPagination = false,
    expansion,
    enablePinning = true,
  } = options;

  const hasExpansion = Boolean(expansion);

  const resolvedColumns = useMemo<ResolvedColumn<T>[]>(() => {
    const base: ColumnDef<T>[] = hasExpansion
      ? [
          {
            key: EXPANDER_COLUMN_KEY,
            header: '',
            srHeader: 'Expand row',
            width: EXPANDER_WIDTH,
            sortable: false,
            pinned: columns.some((column) => column.pinned === 'left') ? 'left' : undefined,
          },
          ...columns,
        ]
      : columns;

    let offset = 0;
    let lastPinnedIndex = -1;
    const withPinning: ResolvedColumn<T>[] = base.map((column, index) => {
      const isPinned = enablePinning && column.pinned === 'left';
      const pinnedOffset = offset;
      if (isPinned) {
        if (column.width === undefined && column.key !== EXPANDER_COLUMN_KEY) {
          warnOnce(`Pinned column "${column.key}" has no width; falling back to ${FALLBACK_PINNED_WIDTH}px.`);
        }
        offset += column.width ?? FALLBACK_PINNED_WIDTH;
        lastPinnedIndex = index;
      }
      return {
        ...column,
        isExpander: column.key === EXPANDER_COLUMN_KEY,
        isPinned,
        pinnedOffset,
        isLastPinned: false,
      };
    });

    if (lastPinnedIndex >= 0) {
      const last = withPinning[lastPinnedIndex];
      if (last) withPinning[lastPinnedIndex] = { ...last, isLastPinned: true };
    }
    return withPinning;
  }, [columns, hasExpansion, enablePinning]);

  const sorting = useSorting({
    sortState: options.sortState,
    defaultSortState: options.defaultSortState,
    onSortChange: options.onSortChange,
  });

  const sortedData = useMemo(() => {
    const { sortState } = sorting;
    if (manualSorting || !sortState) return data;

    const column = resolvedColumns.find((candidate) => candidate.key === sortState.columnKey);
    if (!column || column.sortable === false || column.isExpander) {
      warnOnce(`Unknown or unsortable sort key "${sortState.columnKey}"; rendering unsorted.`);
      return data;
    }

    const descending = sortState.direction === 'desc';
    if (column.sortComparator) {
      const comparator = column.sortComparator;
      return data
        .map((row, index) => ({ row, index }))
        .sort((a, b) => comparator(a.row, b.row) * (descending ? -1 : 1) || a.index - b.index)
        .map((entry) => entry.row);
    }

    /**
     * Sort values are computed once per row rather than on every comparison, so
     * an expensive accessor runs O(n) instead of O(n log n). The index tiebreak
     * keeps equal rows in their original order.
     */
    const accessor = column.sortAccessor ?? ((row: T) => readValue(row, column.key));
    return data
      .map((row, index) => ({ row, index, value: accessor(row) }))
      .sort((a, b) => compareSortValues(a.value, b.value, descending) || a.index - b.index)
      .map((entry) => entry.row);
  }, [data, sorting, manualSorting, resolvedColumns]);

  const totalCount = manualPagination ? (options.totalCount ?? data.length) : sortedData.length;

  const pagination = usePagination({
    pagination: options.pagination,
    defaultPagination: options.defaultPagination,
    onPaginationChange: options.onPaginationChange,
    totalCount,
  });

  const expansionState = useRowExpansion({
    expanded: expansion?.expanded,
    defaultExpanded: expansion?.defaultExpanded,
    onExpandedChange: expansion?.onExpandedChange,
  });

  const pagedData = useMemo(() => {
    if (manualPagination) return sortedData;
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, manualPagination, pagination.pageIndex, pagination.pageSize]);

  const rows = useMemo<RenderRow<T>[]>(() => {
    const offset = manualPagination ? 0 : pagination.pageIndex * pagination.pageSize;
    const seen = new Set<string>();
    return pagedData.map((row, index) => {
      const id = getRowId(row, offset + index);
      if (seen.has(id)) {
        warnOnce(`Duplicate row id "${id}". Expansion and re-render keys need unique ids.`);
      }
      seen.add(id);
      return {
        id,
        data: row,
        canExpand: hasExpansion ? (expansion?.canExpand?.(row) ?? true) : false,
        isExpanded: expansionState.isExpanded(id),
      };
    });
  }, [
    pagedData,
    getRowId,
    manualPagination,
    pagination.pageIndex,
    pagination.pageSize,
    hasExpansion,
    expansion,
    expansionState,
  ]);

  const isSortable = useCallback(
    (column: ResolvedColumn<T>) => column.sortable === true && !column.isExpander,
    [],
  );

  return {
    rows,
    columns: resolvedColumns,
    sorting,
    pagination,
    expansion: expansionState,
    hasExpansion,
    isSortable,
    totalCount,
  };
}
