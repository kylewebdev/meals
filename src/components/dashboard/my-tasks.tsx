import { PortionDisplay } from '@/components/contributions/portion-display';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatWeekRange } from '@/lib/schedule-utils';
import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import Link from 'next/link';

interface MyTasksProps {
  swapDays: UpcomingSwapDay[];
  headcount: number;
}

export function MyTasks({ swapDays, headcount }: MyTasksProps) {
  if (swapDays.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Your Assigned Recipes</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {swapDays.map((sd) => (
          <Link
            key={sd.id}
            href={`/week/${sd.weekId}`}
            className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{sd.label}</span>
                <span className="text-xs text-zinc-500">
                  {formatWeekRange(sd.weekStartDate)}
                </span>
              </div>
              {sd.assignedRecipe ? (
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {sd.assignedRecipe.name}
                </p>
              ) : (
                <p className="text-sm text-zinc-400">No recipe assigned</p>
              )}
              <PortionDisplay
                headcount={headcount}
                coversFrom={sd.coversFrom}
                coversTo={sd.coversTo}
              />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
