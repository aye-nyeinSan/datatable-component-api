import { NextResponse } from 'next/server';
import { getAllClasses, stripAttendees } from '@/server/mock/classes.mock';
import { delay } from '@/server/mock/simulate';
import { applyTableQuery, parseTableQuery } from '@/utils/tableQuery';
import type { ClassSession } from '@/schemas/timetable.schema';
import type { SortValue } from '@/utils/compare';

function getSortValue(session: ClassSession, key: string): SortValue {
  switch (key) {
    case 'time':
      return session.startsAt;
    case 'attendance':
      return session.capacity === 0 ? 0 : session.booked / session.capacity;
    default:
      return (session as unknown as Record<string, SortValue>)[key];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseTableQuery(url);
  const withChildren = url.searchParams.get('children') === 'inline';

  if (query.latency) await delay(query.latency);
  if (query.fail) {
    return NextResponse.json({ message: 'Timetable service is unavailable.' }, { status: 503 });
  }

  const source = withChildren ? getAllClasses() : stripAttendees(getAllClasses());
  return NextResponse.json(applyTableQuery(source, query, getSortValue));
}
