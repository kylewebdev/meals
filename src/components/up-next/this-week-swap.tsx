import { formatWeekRange, getSwapDate } from '@/lib/schedule-utils';
import type { CurrentWeek } from '@/lib/queries/schedule';
import Link from 'next/link';

interface ThisWeekSwapProps {
  week: CurrentWeek;
  userHouseholdId: string | null;
}

const dateFmt: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };

export function ThisWeekSwap({ week, userHouseholdId }: ThisWeekSwapProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {week.isCurrent ? "This Week's Swap" : 'Next Swap'}
          </h3>
          <p className="text-sm text-zinc-500">{formatWeekRange(week.startDate)}</p>
        </div>
        <Link
          href={`/week/${week.id}`}
          className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          Full breakdown
        </Link>
      </div>

      {week.swapDays.map((sd) => {
        const swapDate = getSwapDate(week.startDate, sd.dayOfWeek);
        return (
          <div key={sd.id}>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              {sd.label} &middot; {swapDate.toLocaleDateString('en-US', dateFmt)}
            </p>
            <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {sd.contributions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-400">No contributions yet</p>
              ) : (
                sd.contributions.map((c) => {
                  const isUser = c.householdId === userHouseholdId;
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-3 py-2 ${
                        isUser ? 'bg-zinc-50 dark:bg-zinc-900' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <span className={`text-sm ${isUser ? 'font-semibold' : ''}`}>
                          {c.household.name}
                        </span>
                        {c.recipe ? (
                          <Link
                            href={`/recipes/${c.recipe.id}?weekId=${week.id}`}
                            className="ml-2 text-sm text-blue-700 hover:underline dark:text-blue-400"
                          >
                            {c.recipe.name}
                          </Link>
                        ) : (
                          <span className="ml-2 text-sm text-zinc-400">
                            {c.dishName ?? 'No recipe'}
                          </span>
                        )}
                      </div>
                      {c.servings && (
                        <span className="shrink-0 text-xs text-zinc-400">
                          {c.servings} servings
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
