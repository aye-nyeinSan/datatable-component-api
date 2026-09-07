import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { getColumnStyle } from './utils';
import type { ResolvedColumn } from './types';

const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3'];

export function DataTableSkeleton<T>({
  columns,
  rowCount,
  density,
}: {
  columns: ResolvedColumn<T>[];
  rowCount: number;
  density: 'compact' | 'comfortable';
}) {
  const paddingY = density === 'compact' ? 'py-2' : 'py-3';

  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((column, columnIndex) => (
            <td
              key={column.key}
              style={getColumnStyle(column)}
              className={cn(
                'border-b border-line px-3',
                paddingY,
                column.isPinned && 'sticky left-0 z-10 bg-surface',
                column.isLastPinned && 'dt-pin-edge border-r border-line',
              )}
            >
              {column.isExpander ? (
                <Skeleton className="size-4 rounded" />
              ) : (
                <Skeleton className={widths[(rowIndex + columnIndex) % widths.length]} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
