import { getSession } from '@/lib/auth-utils';
import { getRecipe } from '@/lib/queries/recipes';
import { getRecipeRatings } from '@/lib/queries/ratings';
import { getScalingContext } from '@/lib/queries/scaling-context';
import { IngredientTable } from '@/components/recipe/ingredient-table';
import { NutritionSummary } from '@/components/recipe/nutrition-summary';
import { RatingList } from '@/components/recipe/rating-list';
import { RatingSummary } from '@/components/recipe/rating-summary';
import { RatingWidget } from '@/components/recipe/rating-widget';
import { RecipeStatusBadge } from '@/components/recipe/recipe-status-badge';
import { ReviewActions } from '@/components/recipe/review-actions';
import { ScalingBanner } from '@/components/recipe/scaling-banner';
import { TagList } from '@/components/recipe/tag-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DeleteRecipeButton } from './delete-button';

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<{ weekId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { recipeId } = await params;
  const { weekId } = await searchParams;
  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  const isAdmin = session.user.role === 'admin';
  const isCreator = recipe.createdBy === session.user.id;

  // Non-admin, non-creator can't see unapproved recipes
  if (recipe.status !== 'approved' && !isAdmin && !isCreator) {
    notFound();
  }

  // Compute scaling context when viewing from a week
  let scaleFactor: number | undefined;
  let scalingCtx: Awaited<ReturnType<typeof getScalingContext>> = null;

  if (weekId && recipe.servings) {
    scalingCtx = await getScalingContext(weekId, recipeId);
    if (scalingCtx) {
      scaleFactor = scalingCtx.portionCount / recipe.servings;
    }
  }

  const canEdit = isAdmin || (isCreator && recipe.status !== 'approved');
  const canDelete = isAdmin || (isCreator && recipe.status !== 'approved');
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recipes" className="text-sm text-zinc-500 hover:text-zinc-700">
          Recipes
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">{recipe.name}</h2>
        {recipe.status !== 'approved' && <RecipeStatusBadge status={recipe.status} />}
      </div>

      {(canEdit || canDelete) && (
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/recipes/${recipeId}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          )}
          {canDelete && <DeleteRecipeButton recipeId={recipeId} />}
        </div>
      )}

      {isAdmin && recipe.status === 'pending' && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Admin Review</h3>
          </CardHeader>
          <CardContent>
            <ReviewActions recipeId={recipeId} />
          </CardContent>
        </Card>
      )}

      {recipe.description && (
        <p className="text-zinc-600 dark:text-zinc-400">{recipe.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
        {recipe.servings && <span>Servings: {recipe.servings}</span>}
        {recipe.prepTimeMinutes && <span>Prep: {recipe.prepTimeMinutes} min</span>}
        {recipe.cookTimeMinutes && <span>Cook: {recipe.cookTimeMinutes} min</span>}
        {totalTime > 0 && <span>Total: {totalTime} min</span>}
      </div>

      <TagList tags={recipe.tags} />

      <NutritionSummary
        calories={recipe.calories}
        proteinG={recipe.proteinG}
        carbsG={recipe.carbsG}
        fatG={recipe.fatG}
        scaleFactor={scaleFactor}
      />

      {scalingCtx && scaleFactor && recipe.servings && (
        <ScalingBanner
          portionCount={scalingCtx.portionCount}
          recipeServings={recipe.servings}
          scaleFactor={scaleFactor}
          swapDayLabel={scalingCtx.swapDayLabel}
          weekStartDate={scalingCtx.weekStartDate}
          weekId={scalingCtx.weekId}
        />
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Ingredients</h3>
        </CardHeader>
        <CardContent>
          {recipe.ingredients.length === 0 ? (
            <p className="text-sm text-zinc-500">No ingredients listed.</p>
          ) : (
            <IngredientTable
              ingredients={recipe.ingredients}
              recipeId={recipeId}
              editable={canEdit}
              scaleFactor={scaleFactor}
            />
          )}
          {canEdit && recipe.ingredients.length === 0 && (
            <IngredientTable ingredients={[]} recipeId={recipeId} editable={true} />
          )}
        </CardContent>
      </Card>

      {recipe.instructions && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Instructions</h3>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{recipe.instructions}</div>
          </CardContent>
        </Card>
      )}

      {recipe.status === 'approved' && (
        <RatingsSection
          recipeId={recipeId}
          householdId={session.user.householdId}
        />
      )}

      <p className="text-xs text-zinc-400">
        Added by {recipe.creator.name}
      </p>
    </div>
  );
}

async function RatingsSection({
  recipeId,
  householdId,
}: {
  recipeId: string;
  householdId?: string | null;
}) {
  const { aggregate, ratings } = await getRecipeRatings(recipeId);
  const myRating = householdId
    ? ratings.find((r) => r.householdId === householdId)
    : undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Ratings</h3>
          <RatingSummary {...aggregate} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {householdId && (
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Your household&apos;s rating
            </p>
            <RatingWidget
              recipeId={recipeId}
              currentRating={myRating?.rating}
              currentComment={myRating?.comment}
            />
          </div>
        )}
        {ratings.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              All household ratings
            </p>
            <RatingList ratings={ratings} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
