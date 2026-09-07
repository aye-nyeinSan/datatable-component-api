'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useMediaQuery';

export function ExpandedRow({
  open,
  panelId,
  colSpan,
  children,
}: {
  open: boolean;
  panelId: string;
  colSpan: number;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [grown, setGrown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (reducedMotion) {
        setGrown(true);
        return;
      }
      /**
       * Two frames: the first commits the collapsed `0fr` track, the second
       * flips it to `1fr`. Growing in a single frame would skip the transition.
       */
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setGrown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setGrown(false);
    if (reducedMotion) setMounted(false);
  }, [open, reducedMotion]);

  if (!mounted) return null;

  return (
    <tr className="bg-canvas/60">
      <td colSpan={colSpan} className="border-b border-line p-0">
        <div
          id={panelId}
          className="dt-collapsible"
          data-open={grown}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'grid-template-rows' && !open) setMounted(false);
          }}
        >
          <div className="dt-collapsible-inner">
            <div className="dt-panel border-l-2 border-brand/40 px-4 py-3 sm:px-6">{children}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}
