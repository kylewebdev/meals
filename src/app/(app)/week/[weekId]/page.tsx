import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions, getHeadcount } from '@/lib/queries/contributions';
import { WeekNutritionChart } from '@/components/contributions/week-nutrition-chart';
import { PortionDisplay } from '@/components/contributions/portion-display';
import { SwapDaySection } from '@/components/swap/swap-day-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWeekRange, getPortionCount } from '@/lib/schedule-utils';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { weekId } = await params;
  const [week, headcount] = await Promise.all([
    getWeekWithContributions(weekId),
    getHeadcount(weekId),
  ]);

  if (!week) notFound();

  const isAdmin = session.user.role === 'admin';
  const totalContributions = week.swapDays.reduce(
    (sum, sd) => sum + sd.contributions.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; Schedule
        </Link>
        <h2 className="mt-1 text-2xl font-bold">{formatWeekRange(week.startDate)}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge>{week.status}</Badge>
          <Badge variant="outline">{week.swapMode} swap</Badge>
        </div>
      </div>

      {isAdmin && (
        <Link href={`/week/${weekId}/edit`}>
          <Button variant="secondary">Edit Logistics</Button>
        </Link>
      )}

      {week.swapDays.length === 0 ? (
        <EmptyState
          title="No swap days configured"
          description="An admin needs to set up swap days for this week."
        />
      ) : (
        week.swapDays.map((sd) => (
          <div key={sd.id} className="space-y-2">
            <div className="flex items-center justify-end">
              <PortionDisplay portions={getPortionCount(headcount, sd.coversFrom, sd.coversTo)} />
            </div>
            <SwapDaySection
              label={sd.label}
              dayOfWeek={sd.dayOfWeek}
              coversFrom={sd.coversFrom}
              coversTo={sd.coversTo}
              location={sd.location}
              time={sd.time}
              notes={sd.notes}
              contributions={sd.contributions}
              weekId={weekId}
            />
          </div>
        ))
      )}

      {totalContributions > 0 && (
        <WeekNutritionChart swapDays={week.swapDays} />
      )}
    </div>
  );
}
