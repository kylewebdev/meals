import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: 'Dashboard — Meals',
};
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getUpcomingSwapDays } from '@/lib/queries/contributions';
import { ensureWeeksExist } from '@/actions/schedule';
import { UpcomingCooks } from '@/components/dashboard/upcoming-cooks';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Auto-populate weeks through end of next month
  await ensureWeeksExist();

  const userHouseholdId = session.user.householdId;

  const [currentWeek, upcomingSwapDays] = await Promise.all([
    getCurrentWeek(),
    userHouseholdId ? getUpcomingSwapDays(userHouseholdId) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Upcoming Cooks</h2>

      {userHouseholdId && upcomingSwapDays.length > 0 ? (
        <UpcomingCooks swapDays={upcomingSwapDays} />
      ) : !currentWeek ? (
        <EmptyState
          title="No week scheduled"
          description={
            session.user.role === 'admin'
              ? 'Configure rotation settings to start auto-generating weeks.'
              : 'An admin needs to configure the rotation settings.'
          }
          action={
            session.user.role === 'admin' ? (
              <Link href="/admin/rotation">
                <Button variant="secondary">Configure Rotation Settings</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <EmptyState
          title="No upcoming cooks"
          description="You don't have any recipes assigned yet."
        />
      )}
    </div>
  );
}
