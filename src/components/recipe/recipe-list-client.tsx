'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import type { RecipeRatingSummary } from '@/lib/queries/ratings';
import { RecipeGrid } from './recipe-grid';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  tags: string[] | null;
}

const filters = [
  { value: '', label: 'All' },
  { value: 'loved', label: 'Loved' },
  { value: 'disliked', label: 'Disliked' },
  { value: 'unrated', label: 'Unrated' },
] as const;

interface RecipeListClientProps {
  recipes: Recipe[];
  summaries: RecipeRatingSummary[];
}

export function RecipeListClient({ recipes, summaries }: RecipeListClientProps) {
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('');
  const deferredQuery = useDeferredValue(query);
  const ratingsMap = useMemo(
    () => new Map(summaries.map((s) => [s.recipeId, s])),
    [summaries],
  );

  const filtered = useMemo(() => {
    let result = recipes;

    if (deferredQuery) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (rating === 'loved') {
      result = result.filter((r) => {
        const s = ratingsMap.get(r.id);
        return s && s.love > 0;
      });
    } else if (rating === 'disliked') {
      result = result.filter((r) => {
        const s = ratingsMap.get(r.id);
        return s && s.dislike > 0;
      });
    } else if (rating === 'unrated') {
      result = result.filter((r) => !ratingsMap.has(r.id));
    }

    return result;
  }, [recipes, deferredQuery, rating, ratingsMap]);

  const hasFilters = !!deferredQuery || !!rating;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRating(f.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                rating === f.value
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No recipes found' : 'No recipes yet'}
          description={
            hasFilters
              ? 'Try a different search or filter.'
              : 'Submit your first recipe to get started.'
          }
        />
      ) : (
        <RecipeGrid recipes={filtered} ratingsMap={ratingsMap} />
      )}
    </>
  );
}
