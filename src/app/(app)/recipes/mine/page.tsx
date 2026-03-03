import { getSession } from '@/lib/auth-utils';
import { getMyRecipes, getRecipeNavCounts } from '@/lib/queries/recipes';
import { RecipeNav } from '@/components/recipe/recipe-nav';
import { RecipeStatusBadge } from '@/components/recipe/recipe-status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyRecipesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [myRecipes, counts] = await Promise.all([
    getMyRecipes(session.user.id),
    getRecipeNavCounts(session.user.id),
  ]);

  const submitted = myRecipes.filter((r) => r.status === 'submitted');
  const pendingReview = myRecipes.filter((r) => r.status === 'pending_review');
  const approved = myRecipes.filter((r) => r.status === 'approved');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recipes</h2>
        <Link href="/recipes/new">
          <Button>Submit Recipe</Button>
        </Link>
      </div>
      <RecipeNav counts={counts} />

      {myRecipes.length === 0 ? (
        <EmptyState
          title="No recipes yet"
          description="Submit a recipe for the co-op to enjoy."
          action={
            <Link href="/recipes/new">
              <Button variant="secondary">Submit Recipe</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {submitted.length > 0 && (
            <RecipeStatusSection title="Workshop" recipes={submitted} editable />
          )}
          {pendingReview.length > 0 && (
            <RecipeStatusSection title="Pending Review" recipes={pendingReview} />
          )}
          {approved.length > 0 && (
            <RecipeStatusSection title="Approved" recipes={approved} />
          )}
        </div>
      )}
    </div>
  );
}

function RecipeStatusSection({
  title,
  recipes,
  editable,
}: {
  title: string;
  recipes: { id: string; name: string; description: string | null; status: string }[];
  editable?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Link href={`/recipes/${recipe.id}`} className="font-medium hover:underline">
                {recipe.name}
              </Link>
              <RecipeStatusBadge status={recipe.status} />
            </div>
            {editable && (
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
