import { getSession } from '@/lib/auth-utils';
import { RecipeForm } from '@/components/recipe/recipe-form';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewRecipePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/recipes" className="text-sm text-zinc-500 hover:text-zinc-700">
        &larr; Recipes
      </Link>
      <h2 className="text-2xl font-bold">
        {isAdmin ? 'New Recipe' : 'Submit Recipe'}
      </h2>
      <div className="flex gap-8">
        <RecipeForm isAdmin={isAdmin} />
        <aside className="hidden w-80 shrink-0 space-y-5 lg:block">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">
              {isAdmin ? 'How to add a recipe' : 'How submissions work'}
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              {isAdmin
                ? 'Fill out the basic info here, then add ingredients and nutrition on the recipe detail page after saving.'
                : 'Submit your recipe for admin review. Once approved, it will appear in the catalog for everyone. You can add ingredients after saving.'}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold">Tags</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Separate tags with commas. Use short labels like{' '}
              <span className="font-mono text-xs">chicken, meal-prep, high-protein</span>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
