'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/recipes/workshop', label: 'Workshop' },
  { href: '/recipes/mine', label: 'My Submissions' },
] as const;

export function RecipeNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
