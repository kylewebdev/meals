import { requireAdmin } from '@/lib/auth-utils';
import { getPendingRecipes } from '@/lib/queries/recipes';
import { ReviewActions } from '@/components/recipe/review-actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RecipeReviewPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const pending = await getPendingRecipes();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recipe Review Queue</h2>

      {pending.length === 0 ? (
        <EmptyState
          title="No recipes to review"
          description="All recipe submissions have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Link href={`/recipes/${recipe.id}`} className="font-semibold hover:underline">
                    {recipe.name}
                  </Link>
                  <span className="text-sm text-zinc-500">
                    {recipe.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {recipe.description}
                  </p>
                )}
                <ReviewActions recipeId={recipe.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
