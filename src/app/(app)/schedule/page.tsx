import { getSession } from '@/lib/auth-utils';
import { getSchedule, getCurrentWeek } from '@/lib/queries/schedule';
import { ScheduleCalendar } from '@/components/schedule/schedule-calendar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.user.role === 'admin';
  const [weeksList, currentWeek] = await Promise.all([getSchedule(), getCurrentWeek()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        {isAdmin && (
          <Link href="/admin/rotation">
            <Button variant="secondary">Manage Rotation</Button>
          </Link>
        )}
      </div>

      <ScheduleCalendar weeks={weeksList} currentWeekId={currentWeek?.id ?? null} />
    </div>
  );
}
