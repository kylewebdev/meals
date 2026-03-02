import { requireAdmin } from '@/lib/auth-utils';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { redirect } from 'next/navigation';

export default async function NewRecipePage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/recipes');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Recipe</h2>
      <RecipeForm />
    </div>
  );
}
