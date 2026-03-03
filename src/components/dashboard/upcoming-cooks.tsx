'use client';

import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UpcomingCooksProps {
  swapDays: UpcomingSwapDay[];
}

/** Get the actual calendar date of the swap, relative to the week's Monday start. */
function getSwapDate(weekStartDate: Date, dayOfWeek: number): Date {
  const date = new Date(weekStartDate);
  // weekStartDate is Monday (1); Sunday (0) is the day before → offset -1
  date.setDate(date.getDate() + (dayOfWeek - 1));
  return date;
}

/** Format the coverage range (e.g. coversFrom=1, coversTo=5 → "Mar 2 – Mar 7") */
function formatCoverageRange(weekStartDate: Date, coversFrom: number, coversTo: number): string {
  const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(weekStartDate);
  start.setDate(start.getDate() + (coversFrom - 1));
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + (coversTo - 1));
  return `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', fmt)}`;
}

const swapDateFmt: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };

export function UpcomingCooks({ swapDays }: UpcomingCooksProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {swapDays.map((sd) => {
        const swapDate = getSwapDate(sd.weekStartDate, sd.dayOfWeek);

        return (
          <div
            key={sd.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/week/${sd.weekId}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/week/${sd.weekId}`);
              }
            }}
            className="cursor-pointer rounded-lg border border-zinc-100 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <div className="space-y-1">
              <div>
                <span className="text-sm font-medium">
                  {sd.label} &middot; {swapDate.toLocaleDateString('en-US', swapDateFmt)}
                </span>
                <p className="text-xs text-zinc-500">
                  Week of {formatCoverageRange(sd.weekStartDate, sd.coversFrom, sd.coversTo)}
                </p>
              </div>
              {sd.assignedRecipe ? (
                <Link
                  href={`/recipes/${sd.assignedRecipe.id}?weekId=${sd.weekId}`}
                  className="block text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {sd.assignedRecipe.name}
                </Link>
              ) : (
                <p className="text-sm text-zinc-400">No recipe assigned</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
