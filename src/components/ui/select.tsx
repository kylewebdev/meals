import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm',
          'focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
          className,
        )}
        {...props}
      />
    );
  },
);
Select.displayName = 'Select';
