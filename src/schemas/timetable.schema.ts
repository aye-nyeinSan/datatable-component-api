export type ClassStatus = 'Scheduled' | 'Full' | 'Cancelled';

export type PaymentType = 'One-time' | 'Package' | 'Membership';

export type BookingStatus = 'Booked' | 'Checked-in' | 'Cancelled' | 'No-show';

export interface Attendee {
  id: string;
  classId: string;
  customerName: string;
  paymentType: PaymentType;
  bookingStatus: BookingStatus;
  bookedAt: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  capacity: number;
  booked: number;
  status: ClassStatus;
  room: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  notes: string;
  attendees?: Attendee[];
}
