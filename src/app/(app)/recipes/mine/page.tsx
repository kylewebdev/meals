import { getSession } from '@/lib/auth-utils';
import { getMyRecipes } from '@/lib/queries/recipes';
import { RecipeStatusBadge } from '@/components/recipe/recipe-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyRecipesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const myRecipes = await getMyRecipes(session.user.id);

  const pending = myRecipes.filter((r) => r.status === 'pending');
  const approved = myRecipes.filter((r) => r.status === 'approved');
  const rejected = myRecipes.filter((r) => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Recipes</h2>
        <Link href="/recipes/new">
          <Button>Submit Recipe</Button>
        </Link>
      </div>

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
          {pending.length > 0 && (
            <RecipeStatusSection title="Pending Review" recipes={pending} editable />
          )}
          {rejected.length > 0 && (
            <RecipeStatusSection title="Needs Changes" recipes={rejected} editable />
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
      <div className="space-y-2">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent className="flex items-center justify-between py-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
