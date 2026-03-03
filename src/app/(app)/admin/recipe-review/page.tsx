import { requireAdmin } from '@/lib/auth-utils';
import { getPendingReviewRecipes } from '@/lib/queries/recipes';
import { ReviewActions } from '@/components/recipe/review-actions';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RecipeReviewPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/up-next');

  const pending = await getPendingReviewRecipes();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Recipe Review Queue</h2>

      {pending.length === 0 ? (
        <EmptyState
          title="No recipes to review"
          description="All recipe submissions have been reviewed."
        />
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {pending.map((recipe) => (
            <div key={recipe.id} className="py-4 first:pt-0">
              <div className="flex items-center justify-between">
                <Link href={`/recipes/${recipe.id}`} className="font-semibold hover:underline">
                  {recipe.name}
                </Link>
                <span className="text-xs text-zinc-400">
                  {recipe.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 space-y-3">
                {recipe.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {recipe.description}
                  </p>
                )}
                <ReviewActions recipeId={recipe.id} currentStatus="pending_review" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
