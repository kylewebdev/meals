import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions } from '@/lib/queries/contributions';
import { SwapDayForm } from '@/components/swap/swap-day-form';
import { BackLink } from '@/components/ui/back-link';
import { formatWeekRange } from '@/lib/schedule-utils';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function EditWeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { weekId } = await params;
  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    redirect(`/week/${weekId}`);
  }

  const week = await getWeekWithContributions(weekId);
  if (!week) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <BackLink href={`/week/${weekId}`}>{formatWeekRange(week.startDate)}</BackLink>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Edit Logistics</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold pb-3">Swap Day Logistics</h3>
        <div className="space-y-4">
          {week.swapDays.map((sd) => (
            <SwapDayForm
              key={sd.id}
              swapDayId={sd.id}
              label={sd.label}
              location={sd.location}
              time={sd.time}
              notes={sd.notes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
