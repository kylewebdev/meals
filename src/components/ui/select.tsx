import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <select
          ref={ref}
          className={cn(
            'h-10 w-full appearance-none rounded border border-zinc-300 bg-white pl-3 pr-9 text-sm',
            'focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
          )}
          {...props}
        />
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
        </svg>
      </div>
    );
  },
);
Select.displayName = 'Select';
