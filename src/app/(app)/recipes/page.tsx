import { getSession } from '@/lib/auth-utils';
import { getRecipes } from '@/lib/queries/recipes';
import { RecipeGrid } from '@/components/recipe/recipe-grid';
import { RecipeSearch } from '@/components/recipe/recipe-search';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { q } = await searchParams;
  const isAdmin = session.user.role === 'admin';
  let allRecipes = await getRecipes();

  if (q) {
    const query = q.toLowerCase();
    allRecipes = allRecipes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags?.some((t) => t.toLowerCase().includes(query)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recipes</h2>
        {isAdmin && (
          <Link href="/recipes/new">
            <Button>Add Recipe</Button>
          </Link>
        )}
      </div>

      <RecipeSearch />

      {allRecipes.length === 0 ? (
        <EmptyState
          title={q ? 'No recipes found' : 'No recipes yet'}
          description={q ? 'Try a different search term.' : 'Add your first recipe to get started.'}
        />
      ) : (
        <RecipeGrid recipes={allRecipes} />
      )}
    </div>
  );
}
