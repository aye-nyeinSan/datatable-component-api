import type { CSSProperties } from 'react';
import type { ColumnAlign, ResolvedColumn } from './types';

const DEFAULT_COLUMN_WIDTH = 160;

export const alignClass: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function getColumnStyle<T>(column: ResolvedColumn<T>): CSSProperties {
  const style: CSSProperties = {};
  if (column.width !== undefined) style.width = column.width;
  if (column.minWidth !== undefined) style.minWidth = column.minWidth;
  if (column.isPinned) style.left = column.pinnedOffset;
  return style;
}

export function getTableMinWidth<T>(columns: ResolvedColumn<T>[]): number {
  return columns.reduce(
    (total, column) => total + (column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH),
    0,
  );
}

export function toErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}
