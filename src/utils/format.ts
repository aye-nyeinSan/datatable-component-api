const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatTimeRange(start: string | Date, end: string | Date): string {
  const from = start instanceof Date ? start : new Date(start);
  const to = end instanceof Date ? end : new Date(end);
  return `${timeFormatter.format(from)} – ${timeFormatter.format(to)}`;
}

export function formatAttendance(booked: number, capacity: number): string {
  return `${booked} / ${capacity}`;
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function formatRelativeMonths(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const months =
    (new Date().getFullYear() - date.getFullYear()) * 12 + (new Date().getMonth() - date.getMonth());
  if (months < 1) return 'This month';
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 yr ago' : `${years} yrs ago`;
}

export function formatRange(pageIndex: number, pageSize: number, total: number): string {
  if (total === 0) return 'No results';
  const first = pageIndex * pageSize + 1;
  const last = Math.min(total, (pageIndex + 1) * pageSize);
  return `${first}–${last} of ${total}`;
}
