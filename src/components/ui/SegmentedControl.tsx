'use client';

import { cn } from '@/utils/cn';

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
}

export function SegmentedControl<V extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: V;
  options: SegmentedOption<V>[];
  onChange: (next: V) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-lg border border-line bg-canvas p-0.5"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition',
                'disabled:pointer-events-none disabled:opacity-45',
                selected
                  ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
