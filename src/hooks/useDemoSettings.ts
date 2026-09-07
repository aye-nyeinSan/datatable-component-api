'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_DEFAULTS as DEFAULTS } from '@/constants/demo';
import type { DemoSettings } from '@/schemas/demo.schema';

/** Only the keys actually present in the URL, so a link can override a screen default. */
function readFromUrl(): Partial<DemoSettings> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const patch: Partial<DemoSettings> = {};
  const mode = params.get('mode');
  if (mode === 'server' || mode === 'client') patch.mode = mode;
  const childMode = params.get('children');
  if (childMode === 'inline' || childMode === 'ondemand') patch.childMode = childMode;
  return patch;
}

export function useDemoSettings(overrides?: Partial<DemoSettings>) {
  /**
   * Screen defaults are applied synchronously so the first fetch already uses
   * them. The URL is only read after mount, because reading it during render
   * would desync the server-rendered markup.
   */
  const [settings, setSettings] = useState<DemoSettings>(() => ({ ...DEFAULTS, ...overrides }));

  useEffect(() => {
    setSettings((previous) => ({ ...previous, ...readFromUrl() }));
  }, []);

  /**
   * The URL is written from an effect, never from inside the state updater.
   * Next.js patches `history.replaceState` to notify its router, so doing it
   * during render would update the Router while this component renders.
   */
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set('mode', settings.mode);
    params.set('children', settings.childMode);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [settings.mode, settings.childMode]);

  const update = useCallback((patch: Partial<DemoSettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  return { settings, update };
}
