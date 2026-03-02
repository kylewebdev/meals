import { getSession } from '@/lib/auth-utils';
import { getRecipe } from '@/lib/queries/recipes';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditRecipePage({
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
  const isCreator = recipe.createdBy === session.user.id;

  // Admin can edit any. Creator can edit pending/rejected.
  if (!isAdmin && !(isCreator && recipe.status !== 'approved')) {
    redirect(`/recipes/${recipeId}`);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Edit Recipe</h2>
      <RecipeForm recipe={recipe} isAdmin={isAdmin} />
    </div>
  );
}
