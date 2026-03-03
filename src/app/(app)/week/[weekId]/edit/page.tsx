import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions } from '@/lib/queries/contributions';
import { SwapDayForm } from '@/components/swap/swap-day-form';
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
        <Link href={`/week/${weekId}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0z" clipRule="evenodd" /></svg>
          {formatWeekRange(week.startDate)}
        </Link>
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
