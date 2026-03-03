import { getSwapDate } from '@/lib/schedule-utils';
import type { RecentCook } from '@/lib/queries/contributions';
import type { RatingAggregate } from '@/lib/queries/ratings';
import Link from 'next/link';

interface RecentCooksProps {
  cooks: RecentCook[];
  ratingsByRecipe: Map<string, RatingAggregate>;
}

const dateFmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

export function RecentCooks({ cooks, ratingsByRecipe }: RecentCooksProps) {
  if (cooks.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Recent Cooks</h3>
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {cooks.map((cook) => {
          const swapDate = getSwapDate(cook.weekStartDate, cook.dayOfWeek);
          const ratings = cook.recipeId ? ratingsByRecipe.get(cook.recipeId) : undefined;

          return (
            <div key={cook.contributionId} className="flex items-center justify-between px-3 py-2.5">
              <div className="min-w-0">
                <span className="text-xs text-zinc-400">
                  {swapDate.toLocaleDateString('en-US', dateFmt)}
                </span>
                {cook.recipeId && cook.recipeName ? (
                  <Link
                    href={`/recipes/${cook.recipeId}`}
                    className="ml-2 text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
                  >
                    {cook.recipeName}
                  </Link>
                ) : (
                  <span className="ml-2 text-sm text-zinc-500">
                    {cook.recipeName ?? 'No recipe'}
                  </span>
                )}
              </div>
              {ratings && ratings.total > 0 && (
                <RatingPills ratings={ratings} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RatingPills({ ratings }: { ratings: RatingAggregate }) {
  return (
    <div className="flex shrink-0 gap-1.5 text-xs">
      {ratings.love > 0 && (
        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {ratings.love} love
        </span>
      )}
      {ratings.fine > 0 && (
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {ratings.fine} fine
        </span>
      )}
      {ratings.dislike > 0 && (
        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {ratings.dislike} dislike
        </span>
      )}
    </div>
  );
}
