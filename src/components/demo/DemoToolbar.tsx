'use client';

import { RotateCw } from '@/icons';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import type { DemoSettings } from '@/schemas/demo.schema';

/** Plain-language description of what the current switches will actually do. */
function describeSettings(settings: DemoSettings, hasChildRows: boolean): string {
  const parts: string[] = [
    settings.mode === 'client'
      ? 'The whole dataset is fetched once, then sorted and paged in the browser.'
      : 'One page is fetched at a time and the server does the sorting.',
  ];

  if (hasChildRows) {
    parts.push(
      settings.childMode === 'inline'
        ? 'Attendees arrive with each class, so expanding a row shows them straight away.'
        : 'Attendees are fetched only when you expand a row.',
    );
  }

  if (settings.latency > 0) parts.push(`Every request is delayed by ${settings.latency}ms.`);
  if (settings.failure === 'table') parts.push('The table request will fail.');
  if (settings.failure === 'children') parts.push('Expanding a row will fail to load its attendees.');
  if (settings.force !== 'none') {
    parts.push(`The table is pinned to its ${settings.force} state regardless of the data.`);
  }

  return parts.join(' ');
}

export function DemoToolbar({
  settings,
  onChange,
  onReload,
  showChildMode = false,
}: {
  settings: DemoSettings;
  onChange: (patch: Partial<DemoSettings>) => void;
  onReload: () => void;
  showChildMode?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Demo controls</h2>
          <p className="mt-0.5 max-w-2xl text-xs text-ink-muted">
            These belong to the demo harness, not the table API. They exist so every state the
            component supports can be reached without editing code.
          </p>
        </div>
        <Button size="sm" onClick={onReload}>
          <RotateCw aria-hidden className="size-3.5" />
          Refetch
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <SegmentedControl
          label="Data"
          value={settings.mode}
          onChange={(mode) => onChange({ mode })}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'server', label: 'Server' },
          ]}
        />

        {showChildMode ? (
          <SegmentedControl
            label="Child rows"
            value={settings.childMode}
            onChange={(childMode) => onChange({ childMode })}
            options={[
              { value: 'inline', label: 'Inline' },
              { value: 'ondemand', label: 'On-demand' },
            ]}
          />
        ) : null}

        <SegmentedControl
          label="Latency"
          value={String(settings.latency)}
          onChange={(value) => onChange({ latency: Number(value) })}
          options={[
            { value: '0', label: 'None' },
            { value: '600', label: '600ms' },
            { value: '2500', label: '2.5s' },
          ]}
        />

        <SegmentedControl
          label="Fail"
          value={settings.failure}
          /**
           * Failing the child fetch only means something when children are fetched,
           * so picking it also switches child rows to on-demand. Otherwise the
           * control would sit there doing nothing in the default inline mode.
           */
          onChange={(failure) =>
            onChange(failure === 'children' ? { failure, childMode: 'ondemand' } : { failure })
          }
          options={[
            { value: 'none', label: 'Off' },
            { value: 'table', label: 'Table' },
            ...(showChildMode ? [{ value: 'children' as const, label: 'Children' }] : []),
          ]}
        />

        <SegmentedControl
          label="Force state"
          value={settings.force}
          onChange={(force) => onChange({ force })}
          options={[
            { value: 'none', label: 'Live' },
            { value: 'loading', label: 'Loading' },
            { value: 'empty', label: 'Empty' },
            { value: 'error', label: 'Error' },
          ]}
        />
      </div>

      <p
        aria-live="polite"
        className="border-t border-line bg-canvas px-4 py-2 text-xs text-ink-muted"
      >
        {describeSettings(settings, showChildMode)}
      </p>
    </section>
  );
}
