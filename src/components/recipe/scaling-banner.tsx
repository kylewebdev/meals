import { formatWeekRange } from '@/lib/schedule-utils';
import type { HouseholdPortion } from '@/lib/queries/scaling-context';
import Link from 'next/link';

interface ScalingBannerProps {
  portionCount: number;
  recipeServings: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
  householdPortions: HouseholdPortion[];
}

export function ScalingBanner({
  portionCount,
  recipeServings,
  swapDayLabel,
  weekStartDate,
  weekId,
  householdPortions,
}: ScalingBannerProps) {
  return (
    <div className="max-w-2xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
        Scaled for <strong>{portionCount} portions</strong>{' '}
        <span className="text-blue-600 dark:text-blue-400">
          (recipe makes {recipeServings})
        </span>
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
      <table className="mt-2 w-full text-xs text-blue-900 dark:text-blue-100">
        <thead>
          <tr className="border-b border-blue-200 dark:border-blue-800">
            <th className="py-1 pr-4 text-left font-medium">Household</th>
            <th className="py-1 pr-4 text-right font-medium">People</th>
            <th className="py-1 pr-4 text-right font-medium">Portions</th>
            <th className="py-1 text-right font-medium">Per person</th>
          </tr>
        </thead>
        <tbody>
          {householdPortions.map((hp) => {
            const perPerson = Math.round((hp.portions / hp.memberCount) * 10) / 10;
            return (
              <tr key={hp.householdId} className="border-b border-blue-100 last:border-0 dark:border-blue-900">
                <td className="py-1 pr-4 font-medium">{hp.householdName}</td>
                <td className="py-1 pr-4 text-right">{hp.memberCount}</td>
                <td className="py-1 pr-4 text-right">{hp.portions}</td>
                <td className="py-1 text-right">{perPerson}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
