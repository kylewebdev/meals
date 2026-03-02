import { PortionDisplay } from '@/components/contributions/portion-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatWeekRange } from '@/lib/schedule-utils';
import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import Link from 'next/link';

interface MyTasksProps {
  swapDays: UpcomingSwapDay[];
  headcount: number;
}

export function MyTasks({ swapDays, headcount }: MyTasksProps) {
  const outstanding = swapDays.filter((sd) => !sd.hasContribution);

  if (outstanding.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <span className="text-sm font-medium">All contributions posted</span>
            <Badge variant="success">Done</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Your Tasks</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {outstanding.map((sd) => (
          <div
            key={sd.id}
            className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{sd.label}</span>
                <span className="text-xs text-zinc-500">
                  {formatWeekRange(sd.weekStartDate)}
                </span>
              </div>
              <PortionDisplay
                headcount={headcount}
                coversFrom={sd.coversFrom}
                coversTo={sd.coversTo}
              />
            </div>
            <Link
              href={`/week/${sd.weekId}/edit`}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Post dish
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
