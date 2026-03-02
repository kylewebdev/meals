import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions, getHeadcount } from '@/lib/queries/contributions';
import { WeekNutritionSummary } from '@/components/contributions/week-nutrition-summary';
import { WeekNutritionChart } from '@/components/contributions/week-nutrition-chart';
import { PortionDisplay } from '@/components/contributions/portion-display';
import { HeadcountDisplay } from '@/components/contributions/headcount-display';
import { SwapDaySection } from '@/components/swap/swap-day-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWeekRange } from '@/lib/schedule-utils';
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
      <div className="flex items-center gap-3">
        <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-700">
          Schedule
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">{formatWeekRange(week.startDate)}</h2>
        <Badge>{week.status}</Badge>
        <Badge variant="outline">{week.swapMode} swap</Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        <HeadcountDisplay count={headcount} />
        <div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
          <span className="text-sm text-zinc-500">Households cooking: </span>
          <span className="font-semibold">{totalContributions}</span>
        </div>
        {isAdmin && (
          <Link href={`/week/${weekId}/edit`}>
            <Button variant="secondary">Edit Logistics</Button>
          </Link>
        )}
      </div>

      {week.swapDays.length === 0 ? (
        <EmptyState
          title="No swap days configured"
          description="An admin needs to set up swap days for this week."
        />
      ) : (
        week.swapDays.map((sd) => (
          <div key={sd.id} className="space-y-2">
            <div className="flex items-center justify-end">
              <PortionDisplay headcount={headcount} />
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
        <>
          <WeekNutritionChart swapDays={week.swapDays} />
          <WeekNutritionSummary swapDays={week.swapDays} />
        </>
      )}
    </div>
  );
}
