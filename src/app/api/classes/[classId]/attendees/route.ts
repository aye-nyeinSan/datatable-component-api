import { NextResponse } from 'next/server';
import { getAttendeesForClass } from '@/server/mock/classes.mock';
import { delay } from '@/server/mock/simulate';
import { parseTableQuery } from '@/utils/tableQuery';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params;
  const query = parseTableQuery(new URL(request.url));

  await delay(query.latency || 650);
  if (query.fail) {
    return NextResponse.json(
      { message: `Could not load attendees for ${classId}.` },
      { status: 503 },
    );
  }

  const rows = getAttendeesForClass(classId); // fetch from mock data
  return NextResponse.json({ rows, totalCount: rows.length });
}
