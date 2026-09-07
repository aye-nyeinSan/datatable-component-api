export interface TableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  latency?: number;
  fail?: boolean;
}

export interface TableResponse<T> {
  rows: T[];
  totalCount: number;
}

export function toSearchParams(query: TableQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortDir) params.set('sortDir', query.sortDir);
  if (query.latency) params.set('latency', String(query.latency));
  if (query.fail) params.set('fail', '1');
  const value = params.toString();
  return value ? `?${value}` : '';
}
