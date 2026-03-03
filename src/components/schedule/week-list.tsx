import { Fragment } from 'react';
import { formatWeekRange, getShortDayName } from '@/lib/schedule-utils';
import { cn } from '@/lib/utils';
import type { ScheduleWeekWithContributions } from '@/lib/queries/schedule';
import Link from 'next/link';

interface WeekListProps {
  weeks: ScheduleWeekWithContributions[];
  currentWeekId: string | null;
}

export function WeekList({ weeks, currentWeekId }: WeekListProps) {
  if (weeks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        No weeks scheduled for this month.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {weeks.map((week) => {
        const isCurrent = week.id === currentWeekId;

        return (
          <Link
            key={week.id}
            href={`/week/${week.id}`}
            className={cn(
              'block rounded-lg border px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900',
              isCurrent
                ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
                : 'border-zinc-100 dark:border-zinc-800',
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-x-3">
              <span className="font-medium">{formatWeekRange(week.startDate)}</span>
            </div>

            {/* Meal list per swap day */}
            {week.swapDays.length > 0 && (
              <div className="mt-3 space-y-3">
                {week.swapDays.map((sd) => {
                  const coversDays = [];
                  for (let d = sd.coversFrom; d <= sd.coversTo; d++) {
                    coversDays.push(getShortDayName(d));
                  }

                  return (
                    <div key={sd.id} className="text-sm">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                          {sd.label}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          covers {coversDays.join(', ')}
                        </span>
                      </div>
                      {sd.contributions.length > 0 ? (
                        <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-sm">
                          {sd.contributions.map((c) => (
                            <Fragment key={c.id}>
                              <span className="text-zinc-500 text-right">{c.household.name}:</span>
                              <span className="text-zinc-800 dark:text-zinc-200">
                                {c.recipe?.name ?? 'TBD'}
                              </span>
                            </Fragment>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-400">No contributions yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {week.swapDays.length === 0 && (
              <p className="mt-1.5 text-xs text-zinc-400">No swap days configured</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
