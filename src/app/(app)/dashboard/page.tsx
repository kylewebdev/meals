import { getSession } from '@/lib/auth-utils';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getHeadcount, getUpcomingSwapDays } from '@/lib/queries/contributions';
import { ensureWeeksExist } from '@/actions/schedule';
import { MyTasks } from '@/components/dashboard/my-tasks';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="text-zinc-600 dark:text-zinc-400">Welcome back, {session.user.name}.</p>

      {userHouseholdId && upcomingSwapDays.length > 0 ? (
        <MyTasks swapDays={upcomingSwapDays} headcount={headcount} />
      ) : !currentWeek ? (
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
      ) : null}
    </div>
  );
}
