import { cn } from '@/lib/utils';
import { type LabelHTMLAttributes, forwardRef } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('mb-1 block text-sm font-medium', className)}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';
