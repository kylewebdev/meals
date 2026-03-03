import { getSession } from '@/lib/auth-utils';
import { getWorkshopRecipes } from '@/lib/queries/recipes';
import { RecipeNav } from '@/components/recipe/recipe-nav';
import { RecipeStatusBadge } from '@/components/recipe/recipe-status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function WorkshopPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const workshopRecipes = await getWorkshopRecipes();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recipes</h2>
        <Link href="/recipes/new">
          <Button>Submit Recipe</Button>
        </Link>
      </div>
      <RecipeNav />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Workshop</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Community recipes being refined. Anyone can edit and discuss these before they get
            approved.
          </p>
        </div>

        {workshopRecipes.length === 0 ? (
          <EmptyState
            title="No workshop recipes"
            description="All recipes have been reviewed. Check back later."
          />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {workshopRecipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/recipes/${recipe.id}`} className="font-medium hover:underline">
                    {recipe.name}
                  </Link>
                  <RecipeStatusBadge status={recipe.status} />
                </div>
                <span className="text-xs text-zinc-400">
                  {recipe.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
