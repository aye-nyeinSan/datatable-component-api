'use client';

import { useCallback } from 'react';
import { LazyRowContent } from '@/components/data-table';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchAttendees } from '@/services/api/classes.api';
import { AttendeeTable } from './AttendeeTable';
import type { Attendee, ClassSession } from '@/schemas/timetable.schema';

function AttendeeSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-label="Loading attendees">
      <Skeleton className="h-3 w-40" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function AttendeePanel({
  session,
  childMode,
  failChildren,
  latency,
}: {
  session: ClassSession;
  childMode: 'inline' | 'ondemand';
  failChildren: boolean;
  latency: number;
}) {
  const load = useCallback(
    (signal: AbortSignal) =>
      fetchAttendees(session.id, { fail: failChildren, latency }, signal),
    [session.id, failChildren, latency],
  );

  if (childMode === 'inline') {
    return <AttendeeTable attendees={session.attendees ?? []} />;
  }

  return (
    <LazyRowContent<Attendee[]>
      cacheKey={`attendees:${session.id}:${failChildren ? 'fail' : 'ok'}:${latency}`}
      load={load}
      fallback={<AttendeeSkeleton />}
    >
      {(attendees) => <AttendeeTable attendees={attendees} />}
    </LazyRowContent>
  );
}
