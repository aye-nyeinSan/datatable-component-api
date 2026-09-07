import Link from 'next/link';

export function Logo({ brand, label }: { brand: string; label: string }) {
  return (
    <Link
      href="/"
      aria-label={`${label} home`}
      className="flex items-center gap-2 rounded-md font-semibold tracking-tight transition hover:opacity-90"
    >
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-sm text-white"
      >
        {brand}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
