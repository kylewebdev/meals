import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'section' | 'interactive' | 'bordered';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  section: '',
  interactive: 'rounded-lg border border-zinc-100 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900',
  bordered: 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'section', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants[variant], className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pb-3', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-3', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';
