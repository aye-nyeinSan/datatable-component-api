'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAsync } from './useAsync';
import { DEFAULT_PAGINATION } from '@/constants/table';
import type { PaginationState, SortState } from '@/components/data-table/types';
import type { TableQuery, TableResponse } from '@/schemas/table.schema';
import type { DataMode } from '@/schemas/demo.schema';

export interface SimulationOptions {
  latency?: number;
  fail?: boolean;
}

export interface UseDataTableOptions<T> {
  mode: DataMode;
  fetchPage: (query: TableQuery, signal: AbortSignal) => Promise<TableResponse<T>>;
  defaultSortState?: SortState;
  defaultPagination?: PaginationState;
  simulate?: SimulationOptions;
  /** Extra identity for the request cache key, e.g. an inline/on-demand switch. */
  scope?: string;
}

export interface UseDataTableResult<T> {
  mode: DataMode;
  rows: T[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | undefined;
  reload: () => void;
  sortState: SortState;
  pagination: PaginationState;
  tableProps: {
    data: T[];
    totalCount: number;
    sortState: SortState;
    onSortChange: (next: SortState) => void;
    pagination: PaginationState;
    onPaginationChange: (next: PaginationState) => void;
    manualSorting: boolean;
    manualPagination: boolean;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | undefined;
    onRetry: () => void;
  };
}

export function useDataTable<T>(options: UseDataTableOptions<T>): UseDataTableResult<T> {
  const { mode, fetchPage, simulate, scope = '' } = options;
  const isServer = mode === 'server';

  const [sortState, setSortState] = useState<SortState>(options.defaultSortState ?? null);
  const [pagination, setPagination] = useState<PaginationState>(
    options.defaultPagination ?? DEFAULT_PAGINATION,
  );

  /**
   * Client mode asks for the whole dataset once, so its key deliberately omits
   * sort and page: changing either must not trigger a refetch.
   */
  const query = useMemo<TableQuery>(
    () =>
      isServer
        ? {
            page: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy: sortState?.columnKey,
            sortDir: sortState?.direction,
            latency: simulate?.latency,
            fail: simulate?.fail,
          }
        : { latency: simulate?.latency, fail: simulate?.fail },
    [isServer, pagination, sortState, simulate?.latency, simulate?.fail],
  );

  const key = `${mode}|${scope}|${JSON.stringify(query)}`;

  const run = useCallback(
    (signal: AbortSignal) => fetchPage(query, signal),
    [fetchPage, query],
  );

  const { data, error, isLoading, isFetching, reload } = useAsync<TableResponse<T>>({
    key,
    run,
    keepPreviousData: isServer,
  });

  const handleSortChange = useCallback((next: SortState) => {
    setSortState(next);
    setPagination((previous) =>
      previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 },
    );
  }, []);

  const rows = data?.rows ?? [];
  const totalCount = data?.totalCount ?? 0;

  return {
    mode,
    rows,
    totalCount,
    isLoading,
    isFetching,
    error,
    reload,
    sortState,
    pagination,
    tableProps: {
      data: rows,
      totalCount,
      sortState,
      onSortChange: handleSortChange,
      pagination,
      onPaginationChange: setPagination,
      manualSorting: isServer,
      manualPagination: isServer,
      isLoading,
      isFetching: isFetching && !isLoading,
      error,
      onRetry: reload,
    },
  };
}
