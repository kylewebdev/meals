import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions } from '@/lib/queries/contributions';
import { applyDayCoverage, getBaseHouseholdData } from '@/lib/queries/scaling-context';
import { WeekNutritionChart } from '@/components/contributions/week-nutrition-chart';
import { PortionBreakdownTable } from '@/components/contributions/portion-breakdown-table';
import { SwapDaySection } from '@/components/swap/swap-day-section';
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
  const [week, baseHouseholdData] = await Promise.all([
    getWeekWithContributions(weekId),
    getBaseHouseholdData(),
  ]);

  if (!week) notFound();

  const isAdmin = session.user.role === 'admin';
  const totalContributions = week.swapDays.reduce(
    (sum, sd) => sum + sd.contributions.length,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0z" clipRule="evenodd" /></svg>
          Schedule
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{formatWeekRange(week.startDate)}</h2>
          {isAdmin && (
            <Link href={`/week/${weekId}/edit`}>
              <Button variant="secondary" size="sm">Edit Logistics</Button>
            </Link>
          )}
        </div>
      </div>

      {week.swapDays.length === 0 ? (
        <EmptyState
          title="No swap days configured"
          description="An admin needs to set up swap days for this week."
        />
      ) : (
        week.swapDays.map((sd) => (
          <div key={sd.id} className="space-y-4">
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
            <PortionBreakdownTable householdPortions={applyDayCoverage(baseHouseholdData, sd.coversFrom, sd.coversTo)} />
          </div>
        ))
      )}

      {totalContributions > 0 && (
        <WeekNutritionChart swapDays={week.swapDays} />
      )}
    </div>
  );
}
