'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Writes the scroll state straight onto the container instead of using React
 * state: scrolling would otherwise re-render every row on each frame. The
 * pinned-cell shadow and the expanded-panel width are pure CSS keyed off these.
 */
export function useScrollShadow(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      element.dataset.scrolledX = String(element.scrollLeft > 1);
      element.style.setProperty('--dt-viewport', `${element.clientWidth}px`);
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref]);
}
