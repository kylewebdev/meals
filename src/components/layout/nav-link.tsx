'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  badge?: number;
  dot?: boolean;
}

export function NavLink({ href, children, className, badge, dot }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
        className,
      )}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className={cn(
          'inline-flex items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-tight',
          isActive
            ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        )}>
          {badge}
        </span>
      )}
      {dot && !badge && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
      )}
    </Link>
  );
}
