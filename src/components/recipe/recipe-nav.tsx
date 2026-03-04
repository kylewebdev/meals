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
  { href: '/admin/recipe-review', label: 'Review', countKey: 'pendingReview', adminOnly: true },
  { href: '/recipes/mine', label: 'My Submissions', countKey: 'mine' },
];

interface RecipeNavProps {
  counts: RecipeNavCounts;
  isAdmin?: boolean;
}

export function RecipeNav({ counts, isAdmin }: RecipeNavProps) {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {links.map(({ href, label, countKey, adminOnly }) => {
        if (adminOnly && !isAdmin) return null;
        const isActive = pathname === href;
        const c = counts[countKey];
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            {label}
            {c != null && (
              <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                {c}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
