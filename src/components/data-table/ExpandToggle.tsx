'use client';

import { ChevronRight } from '@/icons';
import { cn } from '@/utils/cn';

export function ExpandToggle({
  isExpanded,
  panelId,
  label,
  onToggle,
}: {
  isExpanded: boolean;
  panelId: string;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={isExpanded ? panelId : undefined}
      onClick={onToggle}
      className={cn(
        'grid size-7 place-items-center rounded-md text-ink-muted transition',
        'hover:bg-brand-soft hover:text-brand',
      )}
    >
      <ChevronRight
        aria-hidden
        className={cn('size-4 transition-transform duration-200', isExpanded && 'rotate-90')}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
