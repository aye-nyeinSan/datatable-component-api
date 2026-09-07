export type SortValue = string | number | boolean | Date | null | undefined;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function isEmpty(value: SortValue): value is null | undefined {
  return value === null || value === undefined || value === '';
}

function compareDefined(a: NonNullable<SortValue>, b: NonNullable<SortValue>): number {
  if (a instanceof Date || b instanceof Date) {
    return Number(a instanceof Date ? a.getTime() : a) - Number(b instanceof Date ? b.getTime() : b);
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Empty values always sort last, in both directions, so flipping the sort never
 * fills the first page with blanks.
 */
export function compareSortValues(a: SortValue, b: SortValue, descending: boolean): number {
  const aEmpty = isEmpty(a);
  const bEmpty = isEmpty(b);
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  const result = compareDefined(a, b);
  return descending ? -result : result;
}
