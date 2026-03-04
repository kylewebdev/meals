'use client';

import { useState } from 'react';
import { formatWeekRange } from '@/lib/schedule-utils';
import type { HouseholdMeals } from '@/lib/queries/scaling-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ScalingBannerProps {
  mealCount: number;
  totalMeals: number;
  recipeServings: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
  householdMeals: HouseholdMeals[];
  className?: string;
}

export function ScalingBanner({
  mealCount,
  totalMeals,
  recipeServings,
  swapDayLabel,
  weekStartDate,
  weekId,
  householdMeals,
  className,
}: ScalingBannerProps) {
  const [open, setOpen] = useState(false);
  const householdCount = householdMeals.length || 1;
  return (
    <div className={cn(
      'rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950',
      className,
    )}>
      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
        Cook <span className="text-2xl font-bold">{mealCount}</span> meals
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
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
      >
        <svg
          className={cn('h-3 w-3 transition-transform', open && 'rotate-90')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {totalMeals} total &divide; {householdCount} households
      </button>
      {open && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs text-blue-900 dark:text-blue-100">
            <thead>
              <tr className="border-b border-blue-200 dark:border-blue-800">
                <th className="py-1 pr-4 text-left font-medium">Household</th>
                <th className="py-1 pr-4 text-right font-medium">People</th>
                <th className="py-1 text-right font-medium">Meals</th>
              </tr>
            </thead>
            <tbody>
              {householdMeals.map((hp) => (
                <tr key={hp.householdId} className="border-b border-blue-100 last:border-0 dark:border-blue-900">
                  <td className="py-1 pr-4 font-medium">{hp.householdName}</td>
                  <td className="py-1 pr-4 text-right">
                    {hp.memberCount}
                    {hp.extraMeals > 0 && (
                      <span className="text-blue-500 dark:text-blue-400"> (+{hp.extraMeals})</span>
                    )}
                  </td>
                  <td className="py-1 text-right">{hp.meals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
