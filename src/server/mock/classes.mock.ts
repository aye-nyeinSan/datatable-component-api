import { createRandom, pick } from './simulate';
import type {
  Attendee,
  BookingStatus,
  ClassSession,
  ClassStatus,
  PaymentType,
} from '@/schemas/timetable.schema';

const CLASS_NAMES = [
  'Yoga Flow',
  'Spin Sprint',
  'Reformer Pilates',
  'Boxing Basics',
  'HIIT 45',
  'Barre Sculpt',
  'Deep Stretch',
  'Strength Circuit',
  'Aqua Fit',
  'Mobility Lab',
  'Sunrise Vinyasa',
  'Kettlebell Club',
] as const;

const INSTRUCTORS = [
  'John Doe',
  'Amara Osei',
  'Priya Nair',
  'Marco Bianchi',
  'Lena Fischer',
  'Sam Okafor',
  'Yuki Tanaka',
  'Rosa Delgado',
] as const;

const ROOMS = ['Studio A', 'Studio B', 'Mat Room', 'Pool', 'Mezzanine'] as const;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const FIRST_NAMES = [
  'Ada','Ben','Chloe','Diego','Elena','Farid','Grace','Hana','Ivan','Julia',
  'Kofi','Lara','Mateo','Nina','Omar','Petra','Quinn','Rosa','Sven','Tara',
] as const;
const LAST_NAMES = [
  'Alvarez','Bishop','Chen','Dubois','Eriksen','Faber','Gupta','Haddad','Ibrahim','Jensen',
  'Kowalski','Lindqvist','Moreau','Novak','Ortega','Pereira','Quintero','Rossi','Silva','Tremblay',
] as const;
const PAYMENT_TYPES: readonly PaymentType[] = ['One-time', 'Package', 'Membership'];
const BOOKING_STATUSES: readonly BookingStatus[] = ['Booked', 'Checked-in', 'Cancelled', 'No-show'];

const NOTES = [
  'Bring your own mat',
  'Heated studio',
  'Waitlist open',
  'Instructor covering for Dana',
  'Equipment provided',
  '',
] as const;

const BASE_DAY = '2026-09-07';

function buildAttendees(classId: string, count: number, seed: number): Attendee[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: `${classId}-a${index + 1}`,
    classId,
    customerName: `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`,
    paymentType: pick(random, PAYMENT_TYPES),
    bookingStatus: pick(random, BOOKING_STATUSES),
    bookedAt: `${BASE_DAY}T0${(index % 8) + 1}:15:00.000Z`,
  }));
}

function buildClasses(): ClassSession[] {
  const random = createRandom(20260907);

  return Array.from({ length: 42 }, (_, index) => {
    const id = `cls-${String(index + 1).padStart(3, '0')}`;
    const hour = 6 + (index % 15);
    const minute = index % 2 === 0 ? 0 : 30;
    const durationMinutes = pick(random, [45, 50, 60, 75] as const);
    const capacity = pick(random, [8, 12, 15, 20, 24, 30, 36, 45] as const);

    const start = new Date(`${BASE_DAY}T${String(hour).padStart(2, '0')}:${minute === 0 ? '00' : '30'}:00.000Z`);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    // Row 7 is deliberately empty so the empty-child-list state is always reachable.
    const isEmptyClass = index === 6;
    const isCancelled = index % 11 === 5;
    const booked = isEmptyClass ? 0 : isCancelled ? 0 : Math.min(capacity, 2 + Math.floor(random() * capacity));
    const status: ClassStatus = isCancelled ? 'Cancelled' : booked >= capacity ? 'Full' : 'Scheduled';

    return {
      id,
      name: pick(random, CLASS_NAMES),
      instructor: pick(random, INSTRUCTORS),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      durationMinutes,
      capacity,
      booked,
      status,
      room: pick(random, ROOMS),
      level: pick(random, LEVELS),
      notes: pick(random, NOTES),
      attendees: buildAttendees(id, booked, index + 101),
    } satisfies ClassSession;
  });
}

const CLASSES = buildClasses();

export function getAllClasses(): ClassSession[] {
  return CLASSES;
}

export function getAttendeesForClass(classId: string): Attendee[] {
  return CLASSES.find((session) => session.id === classId)?.attendees ?? [];
}

/** Server mode delivers parent rows without children, matching a real paged endpoint. */
export function stripAttendees(sessions: ClassSession[]): ClassSession[] {
  return sessions.map(({ attendees: _attendees, ...rest }) => rest);
}
