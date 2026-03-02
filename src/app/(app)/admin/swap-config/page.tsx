import { requireAdmin } from '@/lib/auth-utils';
import { getAllWeeks } from '@/lib/queries/schedule';
import { GenerateWeeksButton } from '@/components/schedule/generate-weeks-button';
import { WeekList } from '@/components/schedule/week-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminSwapConfigPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const weeksList = await getAllWeeks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          Admin
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">Swap Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Generate Weeks</h3>
        </CardHeader>
        <CardContent>
          <GenerateWeeksButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Scheduled Weeks ({weeksList.length})</h3>
        </CardHeader>
        <CardContent>
          {weeksList.length === 0 ? (
            <EmptyState
              title="No weeks scheduled"
              description="Use the Generate Weeks button above to create the schedule."
            />
          ) : (
            <WeekList weeks={weeksList} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
