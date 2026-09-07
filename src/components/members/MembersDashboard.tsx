'use client';

import { useCallback } from 'react';
import { DataTable } from '@/components/data-table';
import { DemoToolbar } from '@/components/demo';
import { useDataTable } from '@/hooks/useDataTable';
import { useDemoSettings } from '@/hooks/useDemoSettings';
import { fetchMembers } from '@/services/api/members.api';
import { memberColumns } from './memberColumns';
import type { Member } from '@/schemas/member.schema';
import type { TableQuery } from '@/schemas/table.schema';

export function MembersDashboard() {
  const { settings, update } = useDemoSettings({ mode: 'server' });
  const { mode, latency, failure, force } = settings;

  const fetchPage = useCallback(
    (query: TableQuery, signal: AbortSignal) => fetchMembers(query, signal),
    [],
  );

  const table = useDataTable<Member>({
    mode,
    fetchPage,
    simulate: { latency, fail: failure === 'table' },
    defaultSortState: { columnKey: 'fullName', direction: 'asc' },
    defaultPagination: { pageIndex: 0, pageSize: 20 },
  });

  const forced = {
    data: force === 'empty' ? [] : table.tableProps.data,
    isLoading: force === 'loading' || table.tableProps.isLoading,
    error: force === 'error' ? new Error('Forced error state for review.') : table.tableProps.error,
    totalCount: force === 'empty' ? 0 : table.tableProps.totalCount,
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A different row shape rendered by the same component. No child rows, different cells,{' '}
          {table.totalCount} records.
        </p>
      </div>

      <DemoToolbar settings={settings} onChange={update} onReload={table.reload} />

      <DataTable<Member>
        {...table.tableProps}
        {...forced}
        columns={memberColumns}
        caption="Studio members"
        emptyState="No members found"
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}
