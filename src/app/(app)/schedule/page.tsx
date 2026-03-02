import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { households } from '@/lib/db/schema';
import { getSchedule, getScheduleWithContributions, getCurrentWeek } from '@/lib/queries/schedule';
import { MonthGrid } from '@/components/schedule/month-grid';
import { MonthNavigation } from '@/components/schedule/month-navigation';
import { ScheduleCalendar } from '@/components/schedule/schedule-calendar';
import { Button } from '@/components/ui/button';
import { count } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.user.role === 'admin';
  const { month: monthParam, year: yearParam } = await searchParams;

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth();

  // Date range for the visible calendar grid (padded)
  const gridStart = new Date(year, month, -6); // extra padding for adjacent month days
  const gridEnd = new Date(year, month + 1, 7);

  const [weeksList, weeksWithContributions, currentWeek, [{ count: householdCount }]] =
    await Promise.all([
      getSchedule(),
      getScheduleWithContributions(gridStart, gridEnd),
      getCurrentWeek(),
      db.select({ count: count() }).from(households),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        {isAdmin && (
          <Link href="/admin/swap-config">
            <Button variant="secondary">Swap Settings</Button>
          </Link>
        )}
      </div>

      <MonthNavigation year={year} month={month} />

      <MonthGrid
        year={year}
        month={month}
        weeks={weeksWithContributions}
        householdCount={householdCount}
      />

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700">
          Week list view
        </summary>
        <div className="mt-3">
          <ScheduleCalendar weeks={weeksList} currentWeekId={currentWeek?.id ?? null} />
        </div>
      </details>
    </div>
  );
}
