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
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminRotationPage() {
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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; Admin
        </Link>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Rotation Settings</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold pb-3">Global Config</h3>
        <SettingsForm
          startDate={(settings.startDate as Date).toISOString()}
          householdOrderMode={settings.householdOrderMode as string}
          defaultLocation={settings.defaultLocation as string | null}
          defaultTime={settings.defaultTime as string | null}
        />
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800" />

      <div>
        <h3 className="text-lg font-semibold">Recipe Rotation Order</h3>
        <p className="pb-3 text-sm text-zinc-500">
          Each household gets a different recipe per swap day (Latin-square rotation).
          Recipes cycle through this order across households and days.
        </p>
        <RecipeOrderList orderedRecipes={orderedRecipes} availableRecipes={allRecipes} />
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800" />

      <div>
        <h3 className="text-lg font-semibold">Household Display Order</h3>
        <p className="pb-3 text-sm text-zinc-500">
          All households cook every swap day. Order determines recipe assignment offset.
        </p>
        <HouseholdOrderList
          orderedHouseholds={orderedHouseholds}
          allHouseholds={allHouseholds}
          mode={settings.householdOrderMode as string}
        />
      </div>
    </div>
  );
}
