import { Badge } from '@/components/ui/Badge';
import { formatDate, formatRelativeMonths } from '@/utils/format';
import type { ColumnDef } from '@/components/data-table';
import type { Member, MemberPlan } from '@/schemas/member.schema';

const planTone = {
  Trial: 'neutral',
  Monthly: 'info',
  Annual: 'success',
  Founder: 'warning',
} as const satisfies Record<MemberPlan, 'neutral' | 'info' | 'success' | 'warning'>;

export const memberColumns: ColumnDef<Member>[] = [
  {
    key: 'fullName',
    header: 'Member',
    sortable: true,
    pinned: 'left',
    width: 260,
    cell: (member) => (
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
          {member.fullName
            .split(' ')
            .map((part) => part[0])
            .join('')}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{member.fullName}</span>
          <span className="block truncate text-xs text-ink-muted">{member.email}</span>
        </span>
      </div>
    ),
  },
  { key: 'id', header: 'Member ID', sortable: true, width: 150 },
  {
    key: 'plan',
    header: 'Plan',
    sortable: true,
    width: 140,
    cell: (member) => <Badge tone={planTone[member.plan]}>{member.plan}</Badge>,
  },
  { key: 'homeStudio', header: 'Home studio', sortable: true, width: 170 },
  {
    key: 'joinedAt',
    header: 'Joined',
    sortable: true,
    width: 170,
    cell: (member) => (
      <span title={formatDate(member.joinedAt)}>{formatRelativeMonths(member.joinedAt)}</span>
    ),
  },
  {
    key: 'visitsThisMonth',
    header: 'Visits',
    sortable: true,
    width: 130,
    align: 'right',
    cell: (member) => <span className="dt-numeric">{member.visitsThisMonth}</span>,
  },
  {
    key: 'isActive',
    header: 'Status',
    sortable: true,
    width: 140,
    cell: (member) => (
      <Badge tone={member.isActive ? 'success' : 'neutral'}>
        {member.isActive ? 'Active' : 'Lapsed'}
      </Badge>
    ),
  },
];
