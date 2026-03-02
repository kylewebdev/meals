import { getSession } from '@/lib/auth-utils';
import { getWeekWithPlan, getHeadcount } from '@/lib/queries/meal-plans';
import { WeekGrid } from '@/components/meal-plan/week-grid';
import { WeekNutritionSummary } from '@/components/meal-plan/week-nutrition-summary';
import { HeadcountDisplay } from '@/components/meal-plan/headcount-display';
import { PickupInfo } from '@/components/pickup/pickup-info';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWeekRange } from '@/lib/schedule-utils';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { weekId } = await params;
  const [week, headcount] = await Promise.all([
    getWeekWithPlan(weekId),
    getHeadcount(weekId),
  ]);

  if (!week) notFound();

  const isCookingMember = session.user.householdId === week.household.id;
  const isAdmin = session.user.role === 'admin';
  const canEdit = isCookingMember || isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-700">
          Schedule
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">{formatWeekRange(week.startDate)}</h2>
        <Badge>{week.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
          <span className="text-sm text-zinc-500">Cooking: </span>
          <span className="font-semibold">{week.household.name}</span>
        </div>
        <HeadcountDisplay count={headcount} />
        {canEdit && (
          <Link href={`/week/${weekId}/edit`}>
            <Button variant="secondary">Edit Meal Plan</Button>
          </Link>
        )}
      </div>

      <PickupInfo
        location={week.pickupLocation}
        times={week.pickupTimes}
        notes={week.pickupNotes}
      />

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Meal Plan</h3>
        </CardHeader>
        <CardContent>
          {week.mealPlanEntries.length === 0 ? (
            <EmptyState
              title="No meals planned yet"
              description={canEdit ? 'Click Edit Meal Plan to start adding meals.' : 'The cooking household hasn\'t posted the meal plan yet.'}
            />
          ) : (
            <WeekGrid entries={week.mealPlanEntries} />
          )}
        </CardContent>
      </Card>

      {week.mealPlanEntries.length > 0 && (
        <WeekNutritionSummary entries={week.mealPlanEntries} />
      )}
    </div>
  );
}
