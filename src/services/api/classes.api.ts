// clientside fetching logic
import { getJson } from './http';
import { toSearchParams, type TableQuery, type TableResponse } from '@/schemas/table.schema';
import type { Attendee, ClassSession } from '@/schemas/timetable.schema';

export interface ClassQuery extends TableQuery {
  children?: 'inline' | 'none';
}

export function fetchClasses(
  query: ClassQuery,
  signal?: AbortSignal,
): Promise<TableResponse<ClassSession>> {
  const search = toSearchParams(query);
  const children = query.children === 'inline' ? `${search ? '&' : '?'}children=inline` : '';
  return getJson<TableResponse<ClassSession>>(`/api/classes${search}${children}`, signal);
}

export function fetchAttendees(
  classId: string,
  options: { latency?: number; fail?: boolean } = {},
  signal?: AbortSignal,
): Promise<Attendee[]> {
  const search = toSearchParams(options);
  return getJson<TableResponse<Attendee>>(`/api/classes/${classId}/attendees${search}`, signal).then(
    (response) => response.rows,
  );
}
