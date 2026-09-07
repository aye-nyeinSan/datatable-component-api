'use client';

import { ChevronLeft, ChevronRight } from '@/icons';
import { cn } from '@/utils/cn';
import { formatRange } from '@/utils/format';
import type { Pagination } from '@/hooks/usePagination';

const WINDOW = 1;

/** First page, last page, and a window around the current one; gaps become ellipses. */
function getPageItems(pageIndex: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index);

  const pages = new Set<number>([0, pageCount - 1]);
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const page = pageIndex + offset;
    if (page >= 0 && page < pageCount) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) items.push('gap');
    items.push(page);
  });
  return items;
}

export function DataTablePagination({
  pagination,
  pageSizeOptions,
  disabled,
}: {
  pagination: Pagination;
  pageSizeOptions: number[];
  disabled?: boolean;
}) {
  const { pageIndex, pageSize, pageCount, totalCount } = pagination;
  const items = getPageItems(pageIndex, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5"
    >
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <label htmlFor="dt-page-size" className="font-medium">
          Rows
        </label>
        <select
          id="dt-page-size"
          value={pageSize}
          disabled={disabled}
          onChange={(event) => pagination.setPageSize(Number(event.target.value))}
          className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink disabled:opacity-45"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="dt-numeric hidden sm:inline">
          {formatRange(pageIndex, pageSize, totalCount)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={pagination.previousPage}
          disabled={disabled || !pagination.canPreviousPage}
          aria-label="Previous page"
          className="grid size-8 place-items-center rounded-md border border-line bg-surface text-ink-muted transition hover:bg-canvas hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>

        <span className="dt-numeric px-2 text-xs text-ink-muted sm:hidden">
          {pageIndex + 1} / {pageCount}
        </span>

        <ul className="hidden items-center gap-1 sm:flex">
          {items.map((item, index) =>
            item === 'gap' ? (
              <li key={`gap-${index}`} className="px-1 text-xs text-ink-muted">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => pagination.setPageIndex(item)}
                  disabled={disabled}
                  aria-current={item === pageIndex ? 'page' : undefined}
                  className={cn(
                    'dt-numeric size-8 rounded-md border text-xs transition disabled:pointer-events-none disabled:opacity-40',
                    item === pageIndex
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface text-ink-muted hover:bg-canvas hover:text-ink',
                  )}
                >
                  {item + 1}
                </button>
              </li>
            ),
          )}
        </ul>

        <button
          type="button"
          onClick={pagination.nextPage}
          disabled={disabled || !pagination.canNextPage}
          aria-label="Next page"
          className="grid size-8 place-items-center rounded-md border border-line bg-surface text-ink-muted transition hover:bg-canvas hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </nav>
  );
}
