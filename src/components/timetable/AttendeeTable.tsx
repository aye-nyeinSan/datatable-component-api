'use client';

import { DataTable, type ColumnDef } from '@/components/data-table';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDate } from '@/utils/format';
import { BookingStatusBadge, PaymentTypeBadge } from './StatusBadge';
import type { Attendee } from '@/schemas/timetable.schema';

const attendeeColumns: ColumnDef<Attendee>[] = [
  { key: 'customerName', header: 'Customer', sortable: true, width: 220 },
  {
    key: 'paymentType',
    header: 'Payment',
    sortable: true,
    width: 160,
    cell: (attendee) => <PaymentTypeBadge type={attendee.paymentType} />,
  },
  {
    key: 'bookingStatus',
    header: 'Booking',
    sortable: true,
    width: 160,
    cell: (attendee) => <BookingStatusBadge status={attendee.bookingStatus} />,
  },
  {
    key: 'bookedAt',
    header: 'Booked',
    sortable: true,
    width: 140,
    align: 'right',
    cell: (attendee) => <span className="dt-numeric">{formatDate(attendee.bookedAt)}</span>,
  },
];

function AttendeeCards({ attendees }: { attendees: Attendee[] }) {
  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
      {attendees.map((attendee) => (
        <li key={attendee.id} className="rounded-lg border border-line bg-surface px-3 py-2">
          <p className="font-medium">{attendee.customerName}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <PaymentTypeBadge type={attendee.paymentType} />
            <BookingStatusBadge status={attendee.bookingStatus} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AttendeeTable({ attendees }: { attendees: Attendee[] }) {
  const isWide = useMediaQuery('(min-width: 640px)', true);

  if (attendees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-ink-muted">
        No attendees booked yet.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        Attendees ({attendees.length})
      </p>
      {isWide ? (
        <DataTable
          data={attendees}
          columns={attendeeColumns}
          caption="Attendees for this class"
          density="compact"
          hidePagination
          maxHeight={attendees.length > 8 ? 300 : undefined}
          className="bg-surface"
        />
      ) : (
        <AttendeeCards attendees={attendees} />
      )}
    </div>
  );
}
