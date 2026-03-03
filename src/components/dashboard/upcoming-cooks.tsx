'use client';

import { formatDateRange, getSwapDate } from '@/lib/schedule-utils';
import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UpcomingCooksProps {
  swapDays: UpcomingSwapDay[];
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
                  Week of {formatDateRange(sd.weekStartDate, sd.coversFrom - 1, sd.coversTo - 1)}
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
