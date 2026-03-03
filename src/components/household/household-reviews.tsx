import type { HouseholdReview } from '@/lib/queries/ratings';
import { ratingDotStyles, ratingLabels, ratingTextStyles } from '@/lib/rating-styles';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HouseholdReviewsProps {
  reviews: HouseholdReview[];
}

export function HouseholdReviews({ reviews }: HouseholdReviewsProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-zinc-500">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="flex items-start gap-2.5">
          <span
            className={cn(
              'mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full',
              ratingDotStyles[r.rating],
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <Link
                href={`/recipes/${r.recipeId}`}
                className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              >
                {r.recipeName}
              </Link>
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
