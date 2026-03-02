'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const filters = [
  { value: '', label: 'All' },
  { value: 'loved', label: 'Loved' },
  { value: 'disliked', label: 'Disliked' },
  { value: 'unrated', label: 'Unrated' },
] as const;

export function RecipeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('rating') ?? '';

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('rating', value);
    } else {
      params.delete('rating');
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex gap-1.5">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            current === f.value
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
