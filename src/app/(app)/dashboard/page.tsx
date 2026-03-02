import { getSession } from '@/lib/auth-utils';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getHeadcount, getUpcomingSwapDays } from '@/lib/queries/contributions';
import { ensureWeeksExist } from '@/actions/schedule';
import { MyTasks } from '@/components/dashboard/my-tasks';
import { PortionDisplay } from '@/components/contributions/portion-display';
import { SwapDaySection } from '@/components/swap/swap-day-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWeekRange, getPortionCount } from '@/lib/schedule-utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Auto-populate weeks through end of next month
  await ensureWeeksExist();

  const currentWeek = await getCurrentWeek();
  const headcount = await getHeadcount(currentWeek?.id);
  const userHouseholdId = session.user.householdId;

  const upcomingSwapDays = userHouseholdId
    ? await getUpcomingSwapDays(userHouseholdId)
    : [];

  const totalContributions = currentWeek?.swapDays.reduce(
    (sum, sd) => sum + sd.contributions.length,
    0,
  ) ?? 0;

  const totalPortions = currentWeek?.swapDays.reduce(
    (sum, sd) => sum + getPortionCount(headcount, sd.coversFrom, sd.coversTo),
    0,
  ) ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="text-zinc-600 dark:text-zinc-400">Welcome back, {session.user.name}.</p>

      {userHouseholdId && upcomingSwapDays.length > 0 && (
        <MyTasks swapDays={upcomingSwapDays} headcount={headcount} />
      )}

      {currentWeek ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">
                    {currentWeek.isCurrent ? 'This Week' : 'Next Week'}
                  </h3>
                  <span className="text-sm text-zinc-500">
                    {formatWeekRange(currentWeek.startDate)}
                  </span>
                  <Badge variant="outline">{currentWeek.swapMode} swap</Badge>
                </div>
                <Link href={`/week/${currentWeek.id}`}>
                  <Button variant="secondary" size="sm">View Details</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="rounded bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <span className="text-sm text-zinc-500">Members: </span>
                  <span className="font-medium">{headcount}</span>
                </div>
                <div className="rounded bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <span className="text-sm text-zinc-500">Households cooking: </span>
                  <span className="font-medium">{totalContributions}</span>
                </div>
                {totalPortions > 0 && (
                  <div className="rounded bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                    <span className="text-sm text-zinc-500">Total portions: </span>
                    <span className="font-medium">{totalPortions}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {currentWeek.swapDays.map((sd) => (
            <div key={sd.id} className="space-y-2">
              <div className="flex items-center justify-end">
                <PortionDisplay
                  headcount={headcount}
                  coversFrom={sd.coversFrom}
                  coversTo={sd.coversTo}
                />
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
              />
            </div>
          ))}
        </>
      ) : (
        <EmptyState
          title="No week scheduled"
          description={
            session.user.role === 'admin'
              ? 'Configure swap settings to start auto-generating weeks.'
              : 'An admin needs to configure the swap settings.'
          }
          action={
            session.user.role === 'admin' ? (
              <Link href="/admin/swap-config">
                <Button variant="secondary">Configure Swap Settings</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
