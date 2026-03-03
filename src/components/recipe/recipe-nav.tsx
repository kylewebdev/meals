'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { RecipeNavCounts } from '@/lib/queries/recipes';

interface RecipeNavLink {
  href: string;
  label: string;
  countKey: keyof RecipeNavCounts;
  adminOnly?: boolean;
}

const links: RecipeNavLink[] = [
  { href: '/recipes', label: 'Recipes', countKey: 'recipes' },
  { href: '/recipes/workshop', label: 'Workshop', countKey: 'workshop' },
  { href: '/recipes/mine', label: 'My Submissions', countKey: 'mine' },
  { href: '/admin/recipe-review', label: 'Review', countKey: 'pendingReview', adminOnly: true },
];

interface RecipeNavProps {
  counts: RecipeNavCounts;
  isAdmin?: boolean;
}

export function RecipeNav({ counts, isAdmin }: RecipeNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {links.map(({ href, label, countKey, adminOnly }) => {
        if (adminOnly && !isAdmin) return null;
        const isActive = pathname === href;
        const c = counts[countKey];
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
            {c != null && (
              <span
                className={cn(
                  'ml-1.5 text-xs',
                  isActive
                    ? 'text-zinc-400 dark:text-zinc-500'
                    : 'text-zinc-400 dark:text-zinc-500',
                )}
              >
                {c}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
