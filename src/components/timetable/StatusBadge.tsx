import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { BookingStatus, ClassStatus, PaymentType } from '@/schemas/timetable.schema';

const classTone: Record<ClassStatus, BadgeTone> = {
  Scheduled: 'info',
  Full: 'warning',
  Cancelled: 'danger',
};

const bookingTone: Record<BookingStatus, BadgeTone> = {
  Booked: 'info',
  'Checked-in': 'success',
  Cancelled: 'danger',
  'No-show': 'warning',
};

const paymentTone: Record<PaymentType, BadgeTone> = {
  'One-time': 'neutral',
  Package: 'info',
  Membership: 'success',
};

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  return <Badge tone={classTone[status]}>{status}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={bookingTone[status]}>{status}</Badge>;
}

export function PaymentTypeBadge({ type }: { type: PaymentType }) {
  return <Badge tone={paymentTone[type]}>{type}</Badge>;
}
