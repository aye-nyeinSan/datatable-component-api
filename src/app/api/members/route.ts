import { NextResponse } from 'next/server';
import { getAllMembers } from '@/server/mock/members.mock';
import { delay } from '@/server/mock/simulate';
import { applyTableQuery, parseTableQuery } from '@/utils/tableQuery';
import type { Member } from '@/schemas/member.schema';
import type { SortValue } from '@/utils/compare';

function getSortValue(member: Member, key: string): SortValue {
  return (member as unknown as Record<string, SortValue>)[key];
}

export async function GET(request: Request) {
  const query = parseTableQuery(new URL(request.url));

  if (query.latency) await delay(query.latency);
  if (query.fail) {
    return NextResponse.json({ message: 'Member directory is unavailable.' }, { status: 503 });
  }

  return NextResponse.json(applyTableQuery(getAllMembers(), query, getSortValue));
}
