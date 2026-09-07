'use client';

import type { ReactNode } from 'react';
import { AlertCircle } from '@/icons';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { toErrorMessage } from './utils';

export interface LazyRowContentProps<TData> {
  cacheKey: string;
  load: (signal: AbortSignal) => Promise<TData>;
  children: (data: TData) => ReactNode;
  fallback: ReactNode;
  cache?: boolean;
}

export function LazyRowContent<TData>({
  cacheKey,
  load,
  children,
  fallback,
  cache = true,
}: LazyRowContentProps<TData>) {
  const { data, status, error, reload } = useAsync<TData>({
    key: cacheKey,
    run: load,
    cache,
  });

  if (status === 'error') {
    return (
      <div role="alert" className="flex items-center gap-3 rounded-lg bg-rose-50 px-3 py-2.5">
        <AlertCircle aria-hidden className="size-4 shrink-0 text-rose-500" />
        <p className="flex-1 text-sm text-rose-700">{toErrorMessage(error)}</p>
        <Button size="sm" onClick={reload}>
          Retry
        </Button>
      </div>
    );
  }

  if (status !== 'success' || data === undefined) {
    return <div aria-busy="true">{fallback}</div>;
  }

  return <>{children(data)}</>;
}
