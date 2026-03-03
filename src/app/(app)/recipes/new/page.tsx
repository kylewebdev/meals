import { getSession } from '@/lib/auth-utils';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { BackLink } from '@/components/ui/back-link';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewRecipePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <BackLink href="/recipes">Recipes</BackLink>
      <h2 className="text-2xl font-semibold tracking-tight">
        {isAdmin ? 'New Recipe' : 'Submit Recipe'}
      </h2>
      <div className="flex gap-8">
        <RecipeForm isAdmin={isAdmin} />
        <aside className="hidden w-80 shrink-0 space-y-5 lg:block">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold">
              {isAdmin ? 'How to add a recipe' : 'How submissions work'}
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              {isAdmin
                ? 'Fill out the basic info here, then add ingredients and nutrition on the recipe detail page after saving.'
                : 'Your recipe starts in the Workshop where anyone can help refine it. When it\'s ready, flag it for admin review to get it approved into the catalog. You can add ingredients after saving.'}
            </p>
          </div>

          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold">Tags</h3>
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
