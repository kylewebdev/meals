import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-utils';
import { getRecipe } from '@/lib/queries/recipes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}): Promise<Metadata> {
  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);
  return { title: recipe ? `${recipe.name} — Meals` : 'Recipe — Meals' };
}
import { getRecipeComments } from '@/lib/queries/recipe-comments';
import { getGroceryList } from '@/lib/queries/grocery';
import { getRecipeRatings } from '@/lib/queries/ratings';
import { getScalingContext } from '@/lib/queries/scaling-context';
import { AdminFeedbackBanner } from '@/components/recipe/admin-feedback-banner';
import { FlagForReviewButton } from '@/components/recipe/flag-for-review-button';
import { GroceryListTab } from '@/components/grocery/grocery-list-tab';
import { IngredientGroceryTabs } from '@/components/grocery/ingredient-grocery-tabs';
import { IngredientTable } from '@/components/recipe/ingredient-table';
import dynamic from 'next/dynamic';

const NutritionChart = dynamic(
  () => import('@/components/recipe/nutrition-chart').then((m) => m.NutritionChart),
);
import { RatingList } from '@/components/recipe/rating-list';
import { RatingWidget } from '@/components/recipe/rating-widget';
import { RecipeDiscussion } from '@/components/recipe/recipe-discussion';
import { RecipeStatusBadge } from '@/components/recipe/recipe-status-badge';
import { ReviewActions } from '@/components/recipe/review-actions';
import { ScalingBanner } from '@/components/recipe/scaling-banner';
import { InstructionChecklist } from '@/components/recipe/instruction-checklist';
import { TagList } from '@/components/recipe/tag-list';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DeleteRecipeButton } from './delete-button';
import { RecipeImageSection } from './recipe-image-section';

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

  // Compute scaling context when viewing from a week
  let scaleFactor: number | undefined;
  let scalingCtx: Awaited<ReturnType<typeof getScalingContext>> = null;

  if (weekId && recipe.servings) {
    scalingCtx = await getScalingContext(weekId, recipeId);
    if (scalingCtx) {
      scaleFactor = scalingCtx.portionCount / recipe.servings;
    }
  }

  // Fetch grocery list when viewing from a week with a linked recipe
  const groceryList = scalingCtx
    ? await getGroceryList(scalingCtx.contributionId)
    : null;

  const canEdit = isAdmin || recipe.status !== 'approved';
  const canDelete = isAdmin || (isCreator && recipe.status !== 'approved');
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const hasNutrition = !!(recipe.calories || recipe.proteinG || recipe.carbsG || recipe.fatG);
  const showRatings = recipe.status === 'approved';
  const showDiscussion = recipe.status !== 'approved';

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header: breadcrumb, title, action buttons */}
      <div>
        <BackLink href={weekId ? `/week/${weekId}` : '/recipes'}>
          {weekId ? 'Back to Week' : 'Recipes'}
        </BackLink>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">{recipe.name}</h2>
            {recipe.status !== 'approved' && <RecipeStatusBadge status={recipe.status} />}
          </div>
          <div className="flex gap-2">
            {recipe.status === 'submitted' && (
              <FlagForReviewButton recipeId={recipeId} />
            )}
            {canEdit && (
              <Link href={`/recipes/${recipeId}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
            )}
            {canDelete && <DeleteRecipeButton recipeId={recipeId} />}
          </div>
        </div>
      </div>

      {/* Admin feedback banner */}
      {recipe.status === 'submitted' && recipe.adminFeedback && (
        <div className="mt-4">
          <AdminFeedbackBanner
            feedback={recipe.adminFeedback}
            feedbackAt={recipe.adminFeedbackAt}
          />
        </div>
      )}

      {/* Admin review card for pending_review recipes */}
      {isAdmin && recipe.status === 'pending_review' && (
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Admin Review</h3>
          </CardHeader>
          <CardContent>
            <ReviewActions recipeId={recipeId} currentStatus="pending_review" />
          </CardContent>
        </Card>
      )}

      {/* Admin demote card for approved recipes */}
      {isAdmin && recipe.status === 'approved' && (
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Admin Actions</h3>
          </CardHeader>
          <CardContent>
            <ReviewActions recipeId={recipeId} currentStatus="approved" />
          </CardContent>
        </Card>
      )}

      {/* Meta + image side-by-side on desktop, stacked on mobile */}
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
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
        </div>
        <RecipeImageSection
          recipeId={recipeId}
          imageUrl={recipe.imageUrl}
          canEdit={canEdit}
        />
      </div>

      {/* Content sections */}
      <div className="mt-8 space-y-8">
        {hasNutrition && (
          <>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div>
              <h3 className="text-lg font-semibold pb-3">Nutrition</h3>
              <NutritionChart
                calories={recipe.calories}
                proteinG={recipe.proteinG}
                carbsG={recipe.carbsG}
                fatG={recipe.fatG}
                servings={recipe.servings}
                layout="split"
              />
            </div>
          </>
        )}

        {scalingCtx && recipe.servings && (
          <ScalingBanner
            portionCount={scalingCtx.portionCount}
            totalPortions={scalingCtx.totalPortions}
            recipeServings={recipe.servings}
            swapDayLabel={scalingCtx.swapDayLabel}
            weekStartDate={scalingCtx.weekStartDate}
            weekId={scalingCtx.weekId}
            householdPortions={scalingCtx.householdPortions}
            className="max-w-none"
          />
        )}

        <hr className="border-zinc-100 dark:border-zinc-800" />

        <div>
          {groceryList ? (
            <IngredientGroceryTabs
              ingredientsContent={
                recipe.ingredients.length === 0 ? (
                  <p className="text-sm text-zinc-500">No ingredients listed.</p>
                ) : (
                  <IngredientTable
                    ingredients={recipe.ingredients}
                    recipeId={recipeId}
                    editable={canEdit}
                    scaleFactor={scaleFactor}
                  />
                )
              }
              groceryContent={
                <GroceryListTab listId={groceryList.id} items={groceryList.items} />
              }
            />
          ) : (
            <>
              <h3 className="text-lg font-semibold pb-3">Ingredients</h3>
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
            </>
          )}
        </div>

        {recipe.instructions && (
          <>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div>
              <h3 className="text-lg font-semibold pb-3">Instructions</h3>
              <div className="rounded-lg bg-zinc-50 p-5 dark:bg-zinc-900">
                <InstructionChecklist instructions={recipe.instructions} />
              </div>
            </div>
          </>
        )}

        {showRatings && (
          <>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <RatingsSection
              recipeId={recipeId}
              householdId={session.user.householdId}
            />
          </>
        )}

        {showDiscussion && (
          <>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <DiscussionSection
              recipeId={recipeId}
              currentUserId={session.user.id}
              isAdmin={isAdmin}
            />
          </>
        )}

        <p className="text-xs text-zinc-400">
          Added by {recipe.creator.name}
        </p>
      </div>
    </div>
  );
}

async function DiscussionSection({
  recipeId,
  currentUserId,
  isAdmin,
}: {
  recipeId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const comments = await getRecipeComments(recipeId);

  return (
    <div>
      <h3 className="text-lg font-semibold pb-3">Discussion</h3>
      <RecipeDiscussion
        recipeId={recipeId}
        comments={comments}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
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
  const { love, fine, dislike, total } = aggregate;
  const hasBothSections = !!householdId && ratings.length > 0;

  return (
    <div>
      <div className="pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">Ratings</h3>
          {total > 0 && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {total} household{total !== 1 ? 's' : ''} rated
            </span>
          )}
        </div>
      </div>
      <div className="space-y-6">
        {total > 0 && (
          <div className="space-y-2">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              {love > 0 && (
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(love / total) * 100}%` }}
                />
              )}
              {fine > 0 && (
                <div
                  className="bg-zinc-400 transition-all dark:bg-zinc-500"
                  style={{ width: `${(fine / total) * 100}%` }}
                />
              )}
              {dislike > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(dislike / total) * 100}%` }}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {love > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {love} loved
                  </span>
                </span>
              )}
              {fine > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {fine} fine
                  </span>
                </span>
              )}
              {dislike > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {dislike} disliked
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

        <div className={hasBothSections ? 'grid gap-6 md:grid-cols-2' : ''}>
          {householdId && (
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <h4 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Your household&apos;s rating
              </h4>
              <RatingWidget
                recipeId={recipeId}
                currentRating={myRating?.rating}
                currentComment={myRating?.comment}
              />
            </div>
          )}
          {ratings.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                All household ratings
              </h4>
              <RatingList ratings={ratings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
