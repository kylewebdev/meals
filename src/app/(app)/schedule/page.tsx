import { getSession } from '@/lib/auth-utils';
import { getScheduleWithContributions, getCurrentWeek } from '@/lib/queries/schedule';
import { ensureWeeksExist } from '@/actions/schedule';
import { MonthNavigation } from '@/components/schedule/month-navigation';
import { WeekList } from '@/components/schedule/week-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Auto-populate weeks through end of next month
  await ensureWeeksExist();

  const isAdmin = session.user.role === 'admin';
  const { month: monthParam, year: yearParam } = await searchParams;

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth();

  // Date range: all Mondays that fall within this month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Extend range slightly so we catch weeks that start before the month
  // but whose days spill into it, and weeks starting at end of month
  const queryStart = new Date(monthStart);
  queryStart.setDate(queryStart.getDate() - 6);

  const [weeksWithContributions, currentWeek] = await Promise.all([
    getScheduleWithContributions(queryStart, monthEnd),
    getCurrentWeek(),
  ]);

  // Filter to weeks that overlap with the selected month
  const filteredWeeks = weeksWithContributions.filter((w) => {
    const start = new Date(w.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return start <= monthEnd && end >= monthStart;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        {isAdmin && (
          <Link href="/admin/swap-config">
            <Button variant="secondary">Swap Settings</Button>
          </Link>
        )}
      </div>

      <MonthNavigation year={year} month={month} />

      <WeekList weeks={filteredWeeks} currentWeekId={currentWeek?.id ?? null} />
    </div>
  );
}
