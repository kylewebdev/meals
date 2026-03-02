import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm',
          'placeholder:text-zinc-400',
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
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-zinc-400',
          'focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
          'min-h-[80px] resize-y',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
