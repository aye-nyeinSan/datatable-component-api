import { cn } from '@/utils/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
};

const variants = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  ghost: 'text-ink-muted hover:bg-canvas hover:text-ink',
};

const sizes = {
  sm: 'h-8 px-2.5 text-sm',
  md: 'h-9 px-3.5 text-sm',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition',
        'disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
