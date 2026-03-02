import { getSession } from '@/lib/auth-utils';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getHeadcount } from '@/lib/queries/contributions';
import { SwapDaySection } from '@/components/swap/swap-day-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWeekRange } from '@/lib/schedule-utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentWeek = await getCurrentWeek();
  const headcount = await getHeadcount(currentWeek?.id);

  const userHouseholdId = session.user.householdId;
  const totalContributions = currentWeek?.swapDays.reduce(
    (sum, sd) => sum + sd.contributions.length,
    0,
  ) ?? 0;

  // Check if the user's household has contributed to all swap days
  const missingSwapDays = currentWeek?.swapDays.filter(
    (sd) => userHouseholdId && !sd.contributions.some((c) => c.householdId === userHouseholdId),
  ) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="text-zinc-600 dark:text-zinc-400">Welcome back, {session.user.name}.</p>

      {currentWeek ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">This Week</h3>
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
                  <span className="text-sm text-zinc-500">Contributions: </span>
                  <span className="font-medium">{totalContributions}</span>
                </div>
              </div>

              {missingSwapDays.length > 0 && userHouseholdId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Your household hasn&apos;t contributed to:{' '}
                    {missingSwapDays.map((sd) => sd.label).join(', ')}.{' '}
                    <Link
                      href={`/week/${currentWeek.id}/edit`}
                      className="font-medium underline"
                    >
                      Post your dish
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {currentWeek.swapDays.map((sd) => (
            <SwapDaySection
              key={sd.id}
              label={sd.label}
              dayOfWeek={sd.dayOfWeek}
              coversFrom={sd.coversFrom}
              coversTo={sd.coversTo}
              location={sd.location}
              time={sd.time}
              notes={sd.notes}
              contributions={sd.contributions}
            />
          ))}
        </>
      ) : (
        <EmptyState
          title="No week scheduled"
          description="An admin needs to generate the schedule."
          action={
            session.user.role === 'admin' ? (
              <Link href="/admin/swap-config">
                <Button variant="secondary">Set Up Schedule</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
