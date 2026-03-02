import type { HouseholdRating } from '@/lib/queries/ratings';
import { cn } from '@/lib/utils';

interface RatingListProps {
  ratings: HouseholdRating[];
}

const ratingTextStyles: Record<string, string> = {
  love: 'text-green-600 dark:text-green-500',
  fine: 'text-zinc-500 dark:text-zinc-400',
  dislike: 'text-red-600 dark:text-red-500',
};

const ratingDotStyles: Record<string, string> = {
  love: 'bg-green-500',
  fine: 'bg-zinc-400 dark:bg-zinc-500',
  dislike: 'bg-red-500',
};

const ratingLabels: Record<string, string> = {
  love: 'Loved it',
  fine: 'Fine',
  dislike: 'Disliked',
};

export function RatingList({ ratings }: RatingListProps) {
  if (ratings.length === 0) {
    return <p className="text-sm text-zinc-500">No ratings yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {ratings.map((r) => (
        <li key={r.id} className="flex items-start gap-2.5">
          <span
            className={cn(
              'mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full',
              ratingDotStyles[r.rating],
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {r.householdName}
              </span>
              <span className={cn('shrink-0 text-xs font-medium', ratingTextStyles[r.rating])}>
                {ratingLabels[r.rating]}
              </span>
            </div>
            {r.comment && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{r.comment}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
