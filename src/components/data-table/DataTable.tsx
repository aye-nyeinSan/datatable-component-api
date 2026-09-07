'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import { useTable } from '@/hooks/useTable';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrollShadow } from '@/hooks/useScrollShadow';
import { DataTableHeader } from './DataTableHeader';
import { DataTableRow } from './DataTableRow';
import { DataTableSkeleton } from './DataTableSkeleton';
import { DataTableEmpty, DataTableError } from './DataTableStates';
import { DataTablePagination } from './DataTablePagination';
import { getTableMinWidth } from './utils';
import { DEFAULT_PAGE_SIZES, PIN_BREAKPOINT } from '@/constants/table';
import type { DataTableProps } from './types';

export function DataTable<T>({
  isLoading = false,
  skeletonRowCount,
  error,
  onRetry,
  emptyState,
  isFetching = false,
  caption,
  maxHeight,
  density = 'comfortable',
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  hidePagination = false,
  className,
  ...tableOptions
}: DataTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollShadow(scrollRef);

  /**
   * A sticky column on a phone can eat most of the viewport, so pinning is
   * dropped below the breakpoint and the table simply scrolls instead.
   */
  const wideEnoughToPin = useMediaQuery(PIN_BREAKPOINT, true);
  const table = useTable<T>({
    ...tableOptions,
    enablePinning: tableOptions.enablePinning ?? wideEnoughToPin,
  });

  const { columns, rows, pagination, sorting } = table;
  const columnCount = columns.length;
  const hasError = Boolean(error);
  const showSkeleton = isLoading && !hasError;
  const showEmpty = !showSkeleton && !hasError && rows.length === 0;
  const renderExpanded = tableOptions.expansion?.renderExpanded;

  return (
    <section
      className={cn('overflow-hidden rounded-xl border border-line bg-surface shadow-xs', className)}
    >
      <div ref={scrollRef} className="dt-scroll relative" style={{ maxHeight }}>
        <table
          className="w-full table-fixed border-separate border-spacing-0"
          style={{ minWidth: getTableMinWidth(columns) }}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
          </colgroup>

          <DataTableHeader
            columns={columns}
            sortState={sorting.sortState}
            onToggleSort={sorting.toggleSort}
            isSortable={table.isSortable}
            disabled={showSkeleton || hasError}
          />

          <tbody
            aria-busy={showSkeleton || isFetching}
            className={cn('transition-opacity', isFetching && !showSkeleton && 'opacity-60')}
          >
            {hasError ? (
              <DataTableError colSpan={columnCount} error={error} onRetry={onRetry} />
            ) : showSkeleton ? (
              <DataTableSkeleton
                columns={columns}
                rowCount={skeletonRowCount ?? pagination.pageSize}
                density={density}
              />
            ) : showEmpty ? (
              <DataTableEmpty colSpan={columnCount}>{emptyState}</DataTableEmpty>
            ) : (
              rows.map((row) => (
                <DataTableRow
                  key={row.id}
                  row={row.data}
                  rowId={row.id}
                  columns={columns}
                  density={density}
                  canExpand={row.canExpand}
                  isExpanded={row.isExpanded}
                  expandLabel={row.isExpanded ? 'Collapse row' : 'Expand row'}
                  onToggleExpand={table.hasExpansion ? table.expansion.toggle : undefined}
                  renderExpanded={renderExpanded}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {showSkeleton
          ? 'Loading table data'
          : hasError
            ? 'Table failed to load'
            : `Page ${pagination.pageIndex + 1} of ${pagination.pageCount}, ${table.totalCount} rows${
                sorting.sortState
                  ? `, sorted by ${sorting.sortState.columnKey} ${sorting.sortState.direction === 'asc' ? 'ascending' : 'descending'}`
                  : ''
              }`}
      </p>

      {hidePagination ? null : (
        <DataTablePagination
          pagination={pagination}
          pageSizeOptions={pageSizeOptions}
          disabled={showSkeleton || hasError}
        />
      )}
    </section>
  );
}
