import { getJson } from './http';
import { toSearchParams, type TableQuery, type TableResponse } from '@/schemas/table.schema';
import type { Member } from '@/schemas/member.schema';

export function fetchMembers(
  query: TableQuery,
  signal?: AbortSignal,
): Promise<TableResponse<Member>> {
  return getJson<TableResponse<Member>>(`/api/members${toSearchParams(query)}`, signal);
}
