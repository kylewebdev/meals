import { getSession, isCookingHousehold } from '@/lib/auth-utils';
import { getWeekWithPlan } from '@/lib/queries/meal-plans';
import { getRecipes } from '@/lib/queries/recipes';
import { RecipePicker } from '@/components/meal-plan/recipe-picker';
import { PickupForm } from '@/components/pickup/pickup-form';
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
  const [week, recipesList] = await Promise.all([
    getWeekWithPlan(weekId),
    getRecipes(),
  ]);

  if (!week) notFound();

  const isCooking = await isCookingHousehold(weekId, session.user.id);
  if (!isCooking && session.user.role !== 'admin') {
    redirect(`/week/${weekId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/week/${weekId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          {formatWeekRange(week.startDate)}
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">Edit Meal Plan</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Assign Recipes</h3>
        </CardHeader>
        <CardContent>
          <RecipePicker
            weekId={weekId}
            recipes={recipesList.map((r) => ({ id: r.id, name: r.name }))}
            existingEntries={week.mealPlanEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Pickup Information</h3>
        </CardHeader>
        <CardContent>
          <PickupForm
            weekId={weekId}
            location={week.pickupLocation}
            times={week.pickupTimes}
            notes={week.pickupNotes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
