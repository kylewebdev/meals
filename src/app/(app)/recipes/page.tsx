import { getSession } from '@/lib/auth-utils';
import { getRecipes } from '@/lib/queries/recipes';
import { getRecipeRatingSummaries } from '@/lib/queries/ratings';
import { RecipeGrid } from '@/components/recipe/recipe-grid';
import { RecipeSearch } from '@/components/recipe/recipe-search';
import { RecipeFilters } from '@/components/recipe/recipe-filters';
import { RecipeNav } from '@/components/recipe/recipe-nav';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rating?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { q, rating } = await searchParams;
  const [allRecipesRaw, summaries] = await Promise.all([
    getRecipes(),
    getRecipeRatingSummaries(),
  ]);
  let allRecipes = allRecipesRaw;
  const ratingsMap = new Map(summaries.map((s) => [s.recipeId, s]));

  if (q) {
    const query = q.toLowerCase();
    allRecipes = allRecipes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags?.some((t) => t.toLowerCase().includes(query)),
    );
  }

  if (rating === 'loved') {
    allRecipes = allRecipes.filter((r) => {
      const s = ratingsMap.get(r.id);
      return s && s.love > 0;
    });
  } else if (rating === 'disliked') {
    allRecipes = allRecipes.filter((r) => {
      const s = ratingsMap.get(r.id);
      return s && s.dislike > 0;
    });
  } else if (rating === 'unrated') {
    allRecipes = allRecipes.filter((r) => !ratingsMap.has(r.id));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recipes</h2>
        <Link href="/recipes/new">
          <Button>Submit Recipe</Button>
        </Link>
      </div>

      <RecipeNav />

      <div className="flex flex-wrap items-center gap-3">
        <RecipeSearch />
        <RecipeFilters />
      </div>

      {allRecipes.length === 0 ? (
        <EmptyState
          title={q || rating ? 'No recipes found' : 'No recipes yet'}
          description={
            q || rating
              ? 'Try a different search or filter.'
              : 'Submit your first recipe to get started.'
          }
        />
      ) : (
        <RecipeGrid recipes={allRecipes} ratingsMap={ratingsMap} />
      )}

    </div>
  );
}
