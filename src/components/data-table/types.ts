import type { ReactNode } from 'react';
import type { SortValue } from '@/utils/compare';

export type { SortValue };

export type SortDirection = 'asc' | 'desc';

export type SortState = { columnKey: string; direction: SortDirection } | null;

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export type ExpandedState = Record<string, true>;

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnDef<T> {
  key: Extract<keyof T, string> | (string & {});
  header: ReactNode;
  cell?: (row: T) => ReactNode;
  sortAccessor?: (row: T) => SortValue;
  sortComparator?: (a: T, b: T) => number;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  pinned?: 'left';
  align?: ColumnAlign;
  srHeader?: string;
}

export interface ResolvedColumn<T> extends ColumnDef<T> {
  isExpander: boolean;
  isPinned: boolean;
  pinnedOffset: number;
  isLastPinned: boolean;
}

export interface ExpansionConfig<T> {
  renderExpanded: (row: T) => ReactNode;
  canExpand?: (row: T) => boolean;
  expanded?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;
}

export interface TableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T, index: number) => string;

  sortState?: SortState;
  defaultSortState?: SortState;
  onSortChange?: (next: SortState) => void;
  manualSorting?: boolean;

  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
  manualPagination?: boolean;
  totalCount?: number;

  expansion?: ExpansionConfig<T>;
  enablePinning?: boolean;
}

export interface DataTableProps<T> extends TableOptions<T> {
  isLoading?: boolean;
  skeletonRowCount?: number;
  error?: unknown;
  onRetry?: () => void;
  emptyState?: ReactNode;
  isFetching?: boolean;

  caption?: string;
  /** Caps the scroll container so long bodies scroll vertically instead of growing. */
  maxHeight?: number | string;
  density?: 'compact' | 'comfortable';
  pageSizeOptions?: number[];
  hidePagination?: boolean;
  className?: string;
}
