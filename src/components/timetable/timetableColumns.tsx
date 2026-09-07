import { cn } from '@/utils/cn';
import { formatAttendance, formatTimeRange } from '@/utils/format';
import { ClassStatusBadge } from './StatusBadge';
import type { ColumnDef } from '@/components/data-table';
import type { ClassSession } from '@/schemas/timetable.schema';

function AttendanceCell({ session }: { session: ClassSession }) {
  const ratio = session.capacity === 0 ? 0 : session.booked / session.capacity;
  return (
    <div className="flex items-center gap-2">
      <span className="dt-numeric tabular-nums">
        {formatAttendance(session.booked, session.capacity)}
      </span>
      <span aria-hidden className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
        <span
          className={cn(
            'block h-full rounded-full transition-all',
            ratio >= 1 ? 'bg-amber-500' : 'bg-brand',
          )}
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </span>
    </div>
  );
}

export const timetableColumns: ColumnDef<ClassSession>[] = [
  {
    key: 'name',
    header: 'Class',
    sortable: true,
    pinned: 'left',
    width: 220,
    cell: (session) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{session.name}</p>
        <p className="truncate text-xs text-ink-muted">{session.room}</p>
      </div>
    ),
  },
  { key: 'instructor', header: 'Instructor', sortable: true, width: 170 },
  {
    key: 'time',
    header: 'Time',
    sortable: true,
    width: 190,
    sortAccessor: (session) => session.startsAt,
    cell: (session) => (
      <span className="dt-numeric whitespace-nowrap">
        {formatTimeRange(session.startsAt, session.endsAt)}
      </span>
    ),
  },
  {
    key: 'attendance',
    header: 'Attendance',
    sortable: true,
    width: 160,
    sortAccessor: (session) => (session.capacity === 0 ? 0 : session.booked / session.capacity),
    cell: (session) => <AttendanceCell session={session} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: 140,
    cell: (session) => <ClassStatusBadge status={session.status} />,
  },
  { key: 'room', header: 'Room', sortable: true, width: 140 },
  { key: 'level', header: 'Level', sortable: true, width: 150 },
  {
    key: 'durationMinutes',
    header: 'Duration',
    sortable: true,
    width: 120,
    align: 'right',
    cell: (session) => <span className="dt-numeric">{session.durationMinutes} min</span>,
  },
  {
    key: 'notes',
    header: 'Notes',
    width: 240,
    cell: (session) => (
      <span className="text-ink-muted">{session.notes === '' ? '—' : session.notes}</span>
    ),
  },
];
