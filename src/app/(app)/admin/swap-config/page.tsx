import { requireAdmin } from '@/lib/auth-utils';
import {
  getAllApprovedRecipes,
  getAllHouseholds,
  getApprovedRecipesInOrder,
  getHouseholdsInOrder,
  getOrCreateSwapSettings,
} from '@/lib/queries/swap-settings';
import { getAllWeeks } from '@/lib/queries/schedule';
import { SettingsForm } from '@/components/schedule/settings-form';
import { RecipeOrderList } from '@/components/schedule/recipe-order-list';
import { HouseholdOrderList } from '@/components/schedule/household-order-list';
import { AdminWeekList } from '@/components/schedule/admin-week-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminSwapConfigPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const settings = await getOrCreateSwapSettings();

  const [orderedRecipes, allRecipes, orderedHouseholds, allHouseholds, weeksList] =
    await Promise.all([
      getApprovedRecipesInOrder(settings.recipeOrder as string[]),
      getAllApprovedRecipes(),
      getHouseholdsInOrder(settings.householdOrder as string[]),
      getAllHouseholds(),
      getAllWeeks(),
    ]);

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
          <h3 className="font-semibold">Global Config</h3>
        </CardHeader>
        <CardContent>
          <SettingsForm
            startDate={(settings.startDate as Date).toISOString()}
            swapMode={settings.swapMode as string}
            householdOrderMode={settings.householdOrderMode as string}
            defaultLocation={settings.defaultLocation as string | null}
            defaultTime={settings.defaultTime as string | null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Recipe Rotation Order</h3>
          <p className="text-sm text-zinc-500">
            Recipes cycle through this order across swap days. Each swap day gets the next recipe.
          </p>
        </CardHeader>
        <CardContent>
          <RecipeOrderList orderedRecipes={orderedRecipes} availableRecipes={allRecipes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Household Display Order</h3>
          <p className="text-sm text-zinc-500">
            All households cook every swap day. This controls the display order.
          </p>
        </CardHeader>
        <CardContent>
          <HouseholdOrderList
            orderedHouseholds={orderedHouseholds}
            allHouseholds={allHouseholds}
            mode={settings.householdOrderMode as string}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Scheduled Weeks ({weeksList.length})</h3>
          <p className="text-sm text-zinc-500">
            Weeks auto-populate through end of next month when pages load.
          </p>
        </CardHeader>
        <CardContent>
          {weeksList.length === 0 ? (
            <EmptyState
              title="No weeks yet"
              description="Configure settings above, then visit the schedule page to auto-generate weeks."
            />
          ) : (
            <AdminWeekList weeks={weeksList} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
