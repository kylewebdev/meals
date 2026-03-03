import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  outline: 'border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
