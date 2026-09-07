'use client';

import { useCallback, useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { DemoToolbar } from '@/components/demo';
import { useDataTable } from '@/hooks/useDataTable';
import { useDemoSettings } from '@/hooks/useDemoSettings';
import { fetchClasses } from '@/services/api/classes.api';
import { AttendeePanel } from './AttendeePanel';
import { timetableColumns } from './timetableColumns';
import type { ClassSession } from '@/schemas/timetable.schema';
import type { TableQuery } from '@/schemas/table.schema';

export function TimetableDashboard() {
  const { settings, update } = useDemoSettings();
  const { mode, childMode, latency, failure, force } = settings;

  const fetchPage = useCallback(
    (query: TableQuery, signal: AbortSignal) =>
      fetchClasses({ ...query, children: childMode === 'inline' ? 'inline' : 'none' }, signal),
    [childMode],
  );

  const table = useDataTable<ClassSession>({
    mode,
    fetchPage,
    scope: childMode,
    simulate: { latency, fail: failure === 'table' },
    defaultSortState: { columnKey: 'time', direction: 'asc' },
    defaultPagination: { pageIndex: 0, pageSize: 10 },
  });

  const expansion = useMemo(
    () => ({
      renderExpanded: (session: ClassSession) => (
        <AttendeePanel
          session={session}
          childMode={childMode}
          failChildren={failure === 'children'}
          latency={latency}
        />
      ),
      canExpand: (session: ClassSession) => session.status !== 'Cancelled',
    }),
    [childMode, failure, latency],
  );

  const forced = {
    data: force === 'empty' ? [] : table.tableProps.data,
    isLoading: force === 'loading' || table.tableProps.isLoading,
    error: force === 'error' ? new Error('Forced error state for review.') : table.tableProps.error,
    totalCount: force === 'empty' ? 0 : table.tableProps.totalCount,
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Class timetable</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Expand a class to see who is booked in. Sorting and pagination run{' '}
          {mode === 'client' ? 'in the browser' : 'on the server'}.
        </p>
      </div>

      <DemoToolbar settings={settings} onChange={update} onReload={table.reload} showChildMode />

      <DataTable<ClassSession>
        {...table.tableProps}
        {...forced}
        columns={timetableColumns}
        expansion={expansion}
        caption="Fitness studio class timetable"
        emptyState="No classes scheduled"
        skeletonRowCount={8}
      />
    </div>
  );
}
