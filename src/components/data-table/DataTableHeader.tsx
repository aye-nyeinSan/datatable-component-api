'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from '@/icons';
import { cn } from '@/utils/cn';
import { alignClass, getColumnStyle } from './utils';
import type { ResolvedColumn, SortState } from './types';

interface DataTableHeaderProps<T> {
  columns: ResolvedColumn<T>[];
  sortState: SortState;
  onToggleSort: (columnKey: string) => void;
  isSortable: (column: ResolvedColumn<T>) => boolean;
  disabled: boolean;
}

const ariaSort = {
  asc: 'ascending',
  desc: 'descending',
} as const;

export function DataTableHeader<T>({
  columns,
  sortState,
  onToggleSort,
  isSortable,
  disabled,
}: DataTableHeaderProps<T>) {
  return (
    <thead className="bg-surface">
      <tr>
        {columns.map((column) => {
          const sortable = isSortable(column);
          const direction = sortState?.columnKey === column.key ? sortState.direction : null;
          const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ChevronsUpDown;

          return (
            <th
              key={column.key}
              scope="col"
              style={getColumnStyle(column)}
              aria-sort={sortable ? (direction ? ariaSort[direction] : 'none') : undefined}
              className={cn(
                'border-b border-line bg-surface px-3 py-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase',
                alignClass[column.align ?? 'left'],
                'sticky top-0 z-20',
                column.isPinned && 'left-0 z-30',
                column.isLastPinned && 'dt-pin-edge border-r border-line',
              )}
            >
              {sortable ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleSort(column.key)}
                  className={cn(
                    'group/sort -mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-1.5 rounded px-1.5 py-0.5 transition',
                    'hover:text-ink disabled:pointer-events-none disabled:opacity-60',
                    column.align === 'right' && 'justify-end',
                    column.align === 'center' && 'justify-center',
                    direction && 'text-brand',
                  )}
                >
                  <span className="truncate">{column.header}</span>
                  <Icon
                    aria-hidden
                    className={cn(
                      'size-3.5 shrink-0 transition-opacity',
                      direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-60',
                    )}
                  />
                </button>
              ) : column.srHeader ? (
                <span className="sr-only">{column.srHeader}</span>
              ) : (
                <span className="truncate">{column.header}</span>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
