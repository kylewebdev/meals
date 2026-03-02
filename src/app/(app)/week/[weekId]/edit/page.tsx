import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions } from '@/lib/queries/contributions';
import { SwapDayForm } from '@/components/swap/swap-day-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div>
        <Link href={`/week/${weekId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; {formatWeekRange(week.startDate)}
        </Link>
        <h2 className="mt-1 text-2xl font-bold">Edit Logistics</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Swap Day Logistics</h3>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
