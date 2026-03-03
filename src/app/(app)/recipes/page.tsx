import { getSession } from '@/lib/auth-utils';
import { getRecipes } from '@/lib/queries/recipes';
import { getRecipeRatingSummaries } from '@/lib/queries/ratings';
import { RecipeListClient } from '@/components/recipe/recipe-list-client';
import { RecipeNav } from '@/components/recipe/recipe-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Recipes — Meals',
};

export default async function RecipesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [allRecipes, summaries] = await Promise.all([
    getRecipes(),
    getRecipeRatingSummaries(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recipes</h2>
        <Link href="/recipes/new">
          <Button>Submit Recipe</Button>
        </Link>
      </div>

      <RecipeNav />

      <RecipeListClient recipes={allRecipes} summaries={summaries} />
    </div>
  );
}
