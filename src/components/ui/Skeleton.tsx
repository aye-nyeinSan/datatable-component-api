import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('h-3 animate-pulse rounded bg-line', className)} />;
}
