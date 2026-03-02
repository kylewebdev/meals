import { requireAdmin } from '@/lib/auth-utils';
import { getRotationOrder, getAllWeeks } from '@/lib/queries/schedule';
import { RotationEditor } from '@/components/schedule/rotation-editor';
import { GenerateWeeksButton } from '@/components/schedule/generate-weeks-button';
import { WeekList } from '@/components/schedule/week-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminRotationPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const [householdsList, weeksList] = await Promise.all([
    getRotationOrder(),
    getAllWeeks(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          Admin
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">Rotation & Schedule</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Rotation Order</h3>
        </CardHeader>
        <CardContent>
          {householdsList.length === 0 ? (
            <EmptyState
              title="No households"
              description="Create households before setting up the rotation."
            />
          ) : (
            <RotationEditor households={householdsList} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Generate Weeks</h3>
        </CardHeader>
        <CardContent>
          {householdsList.length === 0 ? (
            <p className="text-sm text-zinc-500">Create households first.</p>
          ) : (
            <GenerateWeeksButton />
          )}
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
