'use client';

import { useCallback, useRef, useState } from 'react';

export interface ControllableStateOptions<S> {
  value?: S;
  defaultValue: S;
  onChange?: (next: S) => void;
}

export type SetControllableState<S> = (next: S | ((previous: S) => S)) => void;

export function useControllableState<S>(
  options: ControllableStateOptions<S>,
): [S, SetControllableState<S>] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<S>(defaultValue);
  const current = isControlled ? value : internal;

  /**
   * Refs mirror the render values so `setState` keeps a stable identity while
   * still resolving functional updates against the newest state. Without this
   * every row would re-render whenever the setter was recreated.
   */
  const latest = useRef(current);
  latest.current = current;
  const controlledRef = useRef(isControlled);
  controlledRef.current = isControlled;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setState = useCallback<SetControllableState<S>>((next) => {
    const resolved =
      typeof next === 'function' ? (next as (previous: S) => S)(latest.current) : next;
    if (Object.is(resolved, latest.current)) return;
    latest.current = resolved;
    if (!controlledRef.current) setInternal(resolved);
    onChangeRef.current?.(resolved);
  }, []);

  return [current, setState];
}
