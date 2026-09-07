'use client';

import { AlertCircle, Inbox } from '@/icons';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { toErrorMessage } from './utils';

export function DataTableEmpty({ colSpan, children }: { colSpan: number; children?: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <Inbox aria-hidden className="size-7 text-ink-muted/60" />
          <p className="text-sm font-medium">{children ?? 'No results'}</p>
          <p className="text-xs text-ink-muted">Try changing filters or adding data.</p>
        </div>
      </td>
    </tr>
  );
}

export function DataTableError({
  colSpan,
  error,
  onRetry,
}: {
  colSpan: number;
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14">
        <div role="alert" className="flex flex-col items-center gap-2 text-center">
          <AlertCircle aria-hidden className="size-7 text-rose-500" />
          <p className="text-sm font-medium">Could not load this table</p>
          <p className="max-w-md text-xs text-ink-muted">{toErrorMessage(error)}</p>
          {onRetry ? (
            <Button size="sm" onClick={onRetry} className="mt-1">
              Try again
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
