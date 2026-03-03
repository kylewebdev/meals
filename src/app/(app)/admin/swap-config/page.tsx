import { requireAdmin } from '@/lib/auth-utils';
import {
  getAllApprovedRecipes,
  getAllHouseholds,
  getApprovedRecipesInOrder,
  getHouseholdsInOrder,
  getOrCreateSwapSettings,
} from '@/lib/queries/swap-settings';
import { SettingsForm } from '@/components/schedule/settings-form';
import { RecipeOrderList } from '@/components/schedule/recipe-order-list';
import { HouseholdOrderList } from '@/components/schedule/household-order-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminSwapConfigPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const settings = await getOrCreateSwapSettings();

  const [orderedRecipes, allRecipes, orderedHouseholds, allHouseholds] =
    await Promise.all([
      getApprovedRecipesInOrder(settings.recipeOrder as string[]),
      getAllApprovedRecipes(),
      getHouseholdsInOrder(settings.householdOrder as string[]),
      getAllHouseholds(),
    ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; Admin
        </Link>
        <h2 className="mt-1 text-2xl font-bold">Swap Settings</h2>
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
            Each household gets a different recipe per swap day (Latin-square rotation).
            Recipes cycle through this order across households and days.
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
            All households cook every swap day. Order determines recipe assignment offset.
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
    </div>
  );
}
