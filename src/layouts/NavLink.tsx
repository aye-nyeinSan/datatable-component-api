'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isActive = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition',
        isActive
          ? 'bg-brand-soft font-medium text-brand'
          : 'text-ink-muted hover:bg-canvas hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
