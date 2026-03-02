import { requireAdmin } from '@/lib/auth-utils';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { redirect } from 'next/navigation';

export default async function NewRecipePage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/recipes');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Recipe</h2>
      <div className="flex gap-8">
        <RecipeForm />
        <aside className="hidden w-80 shrink-0 space-y-5 lg:block">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">How to add a recipe</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Fill out the basic info here, then add ingredients and nutrition on the recipe detail
              page after saving.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">Ingredients</h3>
            <p className="mt-2 text-sm text-zinc-500">
              After creating the recipe, add each ingredient with a name, quantity, and unit.
            </p>
            <div className="mt-3 space-y-1 text-sm text-zinc-500">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Example:</p>
              <div className="rounded bg-zinc-50 px-3 py-2 font-mono text-xs dark:bg-zinc-900">
                <p>Name: chicken thighs</p>
                <p>Qty: 2 &nbsp; Unit: lbs</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">Nutrition per ingredient</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Enter the <span className="font-medium text-zinc-700 dark:text-zinc-300">total</span>{' '}
              calories, protein, carbs, and fat for the full amount of each ingredient — not per
              serving.
            </p>
            <div className="mt-3 space-y-1 text-sm text-zinc-500">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Example:</p>
              <div className="rounded bg-zinc-50 px-3 py-2 font-mono text-xs dark:bg-zinc-900">
                <p>2 lbs chicken thighs</p>
                <p>Cal: 880 &nbsp; P: 120g</p>
                <p>Carbs: 0g &nbsp; Fat: 40g</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              The recipe&rsquo;s total nutrition is automatically calculated by summing all
              ingredients.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">Tags</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Separate tags with commas. Use short labels like{' '}
              <span className="font-mono text-xs">chicken, meal-prep, high-protein</span>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
