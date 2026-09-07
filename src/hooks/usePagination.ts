'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useControllableState } from './useControllableState';
import { DEFAULT_PAGINATION } from '@/constants/table';
import type { PaginationState } from '@/components/data-table/types';

export interface UsePaginationOptions {
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
  totalCount: number;
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination(options: UsePaginationOptions): Pagination {
  const { totalCount } = options;
  const [state, setState] = useControllableState<PaginationState>({
    value: options.pagination,
    defaultValue: options.defaultPagination ?? DEFAULT_PAGINATION,
    onChange: options.onPaginationChange,
  });

  const pageSize = Math.max(1, state.pageSize);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageIndex = Math.min(Math.max(0, state.pageIndex), pageCount - 1);

  /**
   * An out-of-range page renders clamped immediately, then converges the source
   * of truth on the next tick so a controlled parent is told about the change
   * rather than silently disagreeing with what is on screen.
   */
  useEffect(() => {
    if (pageIndex !== state.pageIndex || pageSize !== state.pageSize) {
      setState({ pageIndex, pageSize });
    }
  }, [pageIndex, pageSize, state.pageIndex, state.pageSize, setState]);

  const setPageIndex = useCallback(
    (next: number) => {
      setState((previous) => ({ ...previous, pageIndex: Math.max(0, next) }));
    },
    [setState],
  );

  const setPageSize = useCallback(
    (next: number) => setState({ pageIndex: 0, pageSize: Math.max(1, next) }),
    [setState],
  );

  const nextPage = useCallback(
    () => setState((previous) => ({ ...previous, pageIndex: previous.pageIndex + 1 })),
    [setState],
  );

  const previousPage = useCallback(
    () => setState((previous) => ({ ...previous, pageIndex: Math.max(0, previous.pageIndex - 1) })),
    [setState],
  );

  return useMemo(
    () => ({
      pageIndex,
      pageSize,
      pageCount,
      totalCount,
      canPreviousPage: pageIndex > 0,
      canNextPage: pageIndex < pageCount - 1,
      setPageIndex,
      setPageSize,
      nextPage,
      previousPage,
    }),
    [
      pageIndex,
      pageSize,
      pageCount,
      totalCount,
      setPageIndex,
      setPageSize,
      nextPage,
      previousPage,
    ],
  );
}
