import { requireAdmin } from '@/lib/auth-utils';
import { getRecipe } from '@/lib/queries/recipes';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/recipes');

  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Edit Recipe</h2>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
