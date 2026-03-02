'use client';

import { PortionDisplay } from '@/components/contributions/portion-display';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatWeekRange } from '@/lib/schedule-utils';
import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MyTasksProps {
  swapDays: UpcomingSwapDay[];
  headcount: number;
}

export function MyTasks({ swapDays, headcount }: MyTasksProps) {
  const router = useRouter();

  if (swapDays.length === 0) return null;

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold">Your Assigned Recipes</h3>
        <PortionDisplay headcount={headcount} />
      </CardHeader>
      <CardContent className="space-y-3">
        {swapDays.map((sd) => (
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
            className="cursor-pointer rounded-lg border border-zinc-200 px-4 py-3 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{sd.label}</span>
                <span className="text-xs text-zinc-500">
                  {formatWeekRange(sd.weekStartDate)}
                </span>
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
        ))}
      </CardContent>
    </Card>
  );
}
