import { getSession } from '@/lib/auth-utils';
import { getWeekWithContributions, getHouseholdContribution } from '@/lib/queries/contributions';
import { getRecipes } from '@/lib/queries/recipes';
import { ContributionForm } from '@/components/contributions/contribution-form';
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
  const householdId = session.user.householdId;
  const isAdmin = session.user.role === 'admin';

  if (!householdId && !isAdmin) {
    redirect(`/week/${weekId}`);
  }

  const [week, recipesList, existingContributions] = await Promise.all([
    getWeekWithContributions(weekId),
    getRecipes(),
    householdId ? getHouseholdContribution(weekId, householdId) : Promise.resolve([]),
  ]);

  if (!week) notFound();

  // Build a map of swapDayId → existing contribution for this household
  const contributionBySwapDay = new Map(
    existingContributions.map((c) => [c.swapDayId, c]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/week/${weekId}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          {formatWeekRange(week.startDate)}
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">Post Contribution</h2>
      </div>

      {householdId && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Your Contributions</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {week.swapDays.map((sd) => {
              const existing = contributionBySwapDay.get(sd.id);
              return (
                <ContributionForm
                  key={sd.id}
                  weekId={weekId}
                  swapDayId={sd.id}
                  swapDayLabel={sd.label}
                  recipes={recipesList.map((r) => ({ id: r.id, name: r.name }))}
                  existing={existing ? {
                    id: existing.id,
                    recipeId: existing.recipeId,
                    dishName: existing.dishName,
                    notes: existing.notes,
                    servings: existing.servings,
                  } : undefined}
                />
              );
            })}
          </CardContent>
        </Card>
      )}

      {isAdmin && (
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
      )}
    </div>
  );
}
