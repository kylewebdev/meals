import { formatWeekRange } from '@/lib/schedule-utils';
import Link from 'next/link';

interface ScalingBannerProps {
  portionCount: number;
  recipeServings: number;
  scaleFactor: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
}

export function ScalingBanner({
  portionCount,
  recipeServings,
  scaleFactor,
  swapDayLabel,
  weekStartDate,
  weekId,
}: ScalingBannerProps) {
  const multiplier = Math.round(scaleFactor * 10) / 10;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
        Scaled for <strong>{portionCount} portions</strong>{' '}
        <span className="text-blue-600 dark:text-blue-400">
          (recipe makes {recipeServings})
        </span>{' '}
        &mdash; {multiplier}&times; recipe
      </p>
      <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
        {swapDayLabel} &middot;{' '}
        <Link
          href={`/week/${weekId}`}
          className="underline hover:text-blue-900 dark:hover:text-blue-100"
        >
          {formatWeekRange(weekStartDate)}
        </Link>
      </p>
    </div>
  );
}
