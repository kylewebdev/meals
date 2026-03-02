import { deleteRecipe } from '@/actions/recipes';
import { getSession } from '@/lib/auth-utils';
import { getRecipe } from '@/lib/queries/recipes';
import { IngredientTable } from '@/components/recipe/ingredient-table';
import { NutritionSummary } from '@/components/recipe/nutrition-summary';
import { TagList } from '@/components/recipe/tag-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DeleteRecipeButton } from './delete-button';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  const isAdmin = session.user.role === 'admin';
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recipes" className="text-sm text-zinc-500 hover:text-zinc-700">
          Recipes
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">{recipe.name}</h2>
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <Link href={`/recipes/${recipeId}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <DeleteRecipeButton recipeId={recipeId} />
        </div>
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
      />

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
              editable={isAdmin}
            />
          )}
          {isAdmin && recipe.ingredients.length === 0 && (
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

      <p className="text-xs text-zinc-400">
        Added by {recipe.creator.name}
      </p>
    </div>
  );
}
