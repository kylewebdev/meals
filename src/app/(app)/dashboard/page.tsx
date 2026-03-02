import { getSession } from '@/lib/auth-utils';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getHeadcount } from '@/lib/queries/meal-plans';
import { WeekGrid } from '@/components/meal-plan/week-grid';
import { PickupInfo } from '@/components/pickup/pickup-info';
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
                </div>
                <Link href={`/week/${currentWeek.id}`}>
                  <Button variant="secondary" size="sm">View Details</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="rounded bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <span className="text-sm text-zinc-500">Cooking: </span>
                  <span className="font-medium">{currentWeek.household.name}</span>
                </div>
                <div className="rounded bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <span className="text-sm text-zinc-500">Members: </span>
                  <span className="font-medium">{headcount}</span>
                </div>
              </div>

              <PickupInfo
                location={currentWeek.pickupLocation}
                times={currentWeek.pickupTimes}
                notes={currentWeek.pickupNotes}
              />

              {currentWeek.mealPlanEntries.length > 0 ? (
                <WeekGrid entries={currentWeek.mealPlanEntries} />
              ) : (
                <p className="text-sm text-zinc-500">No meals planned yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          title="No week scheduled"
          description="An admin needs to generate the schedule."
          action={
            session.user.role === 'admin' ? (
              <Link href="/admin/rotation">
                <Button variant="secondary">Set Up Schedule</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
