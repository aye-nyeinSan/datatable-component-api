'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { ExpandToggle } from './ExpandToggle';
import { ExpandedRow } from './ExpandedRow';
import { alignClass, getColumnStyle } from './utils';
import type { ResolvedColumn } from './types';

export interface DataTableRowProps<T> {
  row: T;
  rowId: string;
  columns: ResolvedColumn<T>[];
  density: 'compact' | 'comfortable';
  canExpand: boolean;
  isExpanded: boolean;
  expandLabel: string;
  onToggleExpand?: (rowId: string) => void;
  renderExpanded?: (row: T) => ReactNode;
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function DataTableRowImpl<T>({
  row,
  rowId,
  columns,
  density,
  canExpand,
  isExpanded,
  expandLabel,
  onToggleExpand,
  renderExpanded,
}: DataTableRowProps<T>) {
  const panelId = `dt-panel-${rowId}`;
  const paddingY = density === 'compact' ? 'py-1.5' : 'py-2.5';

  return (
    <>
      <tr
        className={cn(
          'group/row transition-colors hover:bg-canvas',
          isExpanded && 'bg-brand-soft/50',
        )}
      >
        {columns.map((column) => {
          const isPinned = column.isPinned;
          const content = column.isExpander ? (
            canExpand && onToggleExpand ? (
              <ExpandToggle
                isExpanded={isExpanded}
                panelId={panelId}
                label={expandLabel}
                onToggle={() => onToggleExpand(rowId)}
              />
            ) : null
          ) : column.cell ? (
            column.cell(row)
          ) : (
            renderValue((row as Record<string, unknown>)[column.key])
          );

          return (
            <td
              key={column.key}
              style={getColumnStyle(column)}
              className={cn(
                'border-b border-line px-3 align-middle text-sm',
                paddingY,
                alignClass[column.align ?? 'left'],
                isPinned && [
                  'sticky left-0 z-10 bg-surface transition-colors group-hover/row:bg-canvas',
                  isExpanded && 'bg-brand-soft/50',
                ],
                column.isLastPinned && 'dt-pin-edge border-r border-line',
              )}
            >
              {content}
            </td>
          );
        })}
      </tr>

      {canExpand && renderExpanded ? (
        <ExpandedRow open={isExpanded} panelId={panelId} colSpan={columns.length}>
          {renderExpanded(row)}
        </ExpandedRow>
      ) : null}
    </>
  );
}

export const DataTableRow = memo(DataTableRowImpl) as typeof DataTableRowImpl;
