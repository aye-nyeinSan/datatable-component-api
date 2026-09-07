import { compareSortValues, type SortValue } from './compare';

export interface ParsedTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir: 'asc' | 'desc';
  latency: number;
  fail: boolean;
}

function toNumber(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseTableQuery(url: URL): ParsedTableQuery {
  const params = url.searchParams;
  return {
    page: toNumber(params.get('page')),
    pageSize: toNumber(params.get('pageSize')),
    sortBy: params.get('sortBy') ?? undefined,
    sortDir: params.get('sortDir') === 'desc' ? 'desc' : 'asc',
    latency: Math.min(Math.max(toNumber(params.get('latency')) ?? 0, 0), 8000),
    fail: params.get('fail') === '1',
  };
}

/**
 * Sorts then slices. An unknown sort key is ignored rather than rejected, so a
 * stale bookmark cannot break the endpoint.
 */
export function applyTableQuery<T>(
  rows: T[],
  query: ParsedTableQuery,
  getSortValue: (row: T, key: string) => SortValue,
): { rows: T[]; totalCount: number } {
  let result = rows;

  if (query.sortBy) {
    const key = query.sortBy;
    const descending = query.sortDir === 'desc';
    result = rows
      .map((row, index) => ({ row, index, value: getSortValue(row, key) }))
      .sort((a, b) => compareSortValues(a.value, b.value, descending) || a.index - b.index)
      .map((entry) => entry.row);
  }

  const totalCount = result.length;
  if (query.page === undefined || query.pageSize === undefined) {
    return { rows: result, totalCount };
  }

  const pageSize = Math.max(1, query.pageSize);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageIndex = Math.min(Math.max(0, query.page), pageCount - 1);
  const start = pageIndex * pageSize;
  return { rows: result.slice(start, start + pageSize), totalCount };
}
