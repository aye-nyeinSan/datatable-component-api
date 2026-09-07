'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncOptions<T> {
  key: string;
  run: (signal: AbortSignal) => Promise<T>;
  cache?: boolean;
  keepPreviousData?: boolean;
}

export interface AsyncResult<T> {
  data: T | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  isLoading: boolean;
  isFetching: boolean;
  reload: () => void;
}

const resultCache = new Map<string, unknown>();

export function useAsync<T>(options: UseAsyncOptions<T>): AsyncResult<T> {
  const { key, cache = false, keepPreviousData = false } = options;
  const cached = cache ? (resultCache.get(key) as T | undefined) : undefined;

  const [state, setState] = useState<{ data: T | undefined; status: AsyncStatus; error?: Error }>(
    () => (cached !== undefined ? { data: cached, status: 'success' } : { data: undefined, status: 'idle' }),
  );
  const [attempt, setAttempt] = useState(0);

  const runRef = useRef(options.run);
  runRef.current = options.run;

  useEffect(() => {
    const hit = cache ? (resultCache.get(key) as T | undefined) : undefined;
    if (hit !== undefined && attempt === 0) {
      setState({ data: hit, status: 'success' });
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({
      data: keepPreviousData ? previous.data : undefined,
      status: 'loading',
    }));

    runRef
      .current(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (cache) resultCache.set(key, data);
        setState({ data, status: 'success' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: undefined,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => controller.abort();
  }, [key, cache, keepPreviousData, attempt]);

  const reload = useCallback(() => {
    resultCache.delete(key);
    setAttempt((value) => value + 1);
  }, [key]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.status === 'loading' && state.data === undefined,
    isFetching: state.status === 'loading',
    reload,
  };
}
