import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-utils';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getUpcomingSwapDays, getRecentCooksForHousehold } from '@/lib/queries/contributions';
import { getRecipeRatingSummaries } from '@/lib/queries/ratings';
import { ensureWeeksExist } from '@/actions/schedule';
import { YourCook } from '@/components/up-next/your-cook';
import { ThisWeekSwap } from '@/components/up-next/this-week-swap';
import { RecentCooks } from '@/components/up-next/recent-cooks';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Up Next — Meals',
};

export default async function UpNextPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await ensureWeeksExist();

  const userHouseholdId = session.user.householdId;
  const isAdmin = session.user.role === 'admin';

  const [currentWeek, upcomingCooks, recentCooks, ratingSummaries] = await Promise.all([
    getCurrentWeek(),
    userHouseholdId ? getUpcomingSwapDays(userHouseholdId) : Promise.resolve([]),
    userHouseholdId ? getRecentCooksForHousehold(userHouseholdId) : Promise.resolve([]),
    getRecipeRatingSummaries(),
  ]);

  // Build a lookup map from recipe ID → aggregate
  const ratingsByRecipe = new Map(
    ratingSummaries.map((s) => [
      s.recipeId,
      { love: s.love, fine: s.fine, dislike: s.dislike, total: s.total },
    ]),
  );

  if (!currentWeek) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">Up Next</h2>
        <EmptyState
          title="No week scheduled"
          description={
            isAdmin
              ? 'Configure rotation settings to start auto-generating weeks.'
              : 'An admin needs to configure the rotation settings.'
          }
          action={
            isAdmin ? (
              <Link href="/admin/rotation">
                <Button variant="secondary">Configure Rotation Settings</Button>
              </Link>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Up Next</h2>

      <div className="gap-8 md:grid md:grid-cols-2">
        <YourCook upcomingCooks={upcomingCooks} />
        <ThisWeekSwap week={currentWeek} userHouseholdId={userHouseholdId ?? null} />
      </div>

      <RecentCooks cooks={recentCooks} ratingsByRecipe={ratingsByRecipe} />
    </div>
  );
}
