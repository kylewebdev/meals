import type { HouseholdRating } from '@/lib/queries/ratings';
import { cn } from '@/lib/utils';

interface RatingListProps {
  ratings: HouseholdRating[];
}

const ratingStyles: Record<string, string> = {
  love: 'text-green-600',
  fine: 'text-zinc-500',
  dislike: 'text-red-500',
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
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {ratings.map((r) => (
        <li key={r.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{r.householdName}</p>
            {r.comment && (
              <p className="mt-0.5 text-sm text-zinc-500">{r.comment}</p>
            )}
          </div>
          <span className={cn('ml-3 shrink-0 text-sm font-medium', ratingStyles[r.rating])}>
            {ratingLabels[r.rating]}
          </span>
        </li>
      ))}
    </ul>
  );
}
