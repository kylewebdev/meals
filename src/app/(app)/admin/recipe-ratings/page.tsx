import { requireAdmin } from '@/lib/auth-utils';
import { getRecipeRatingSummaries } from '@/lib/queries/ratings';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RecipeRatingsPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const summaries = await getRecipeRatingSummaries();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; Admin
        </Link>
        <h2 className="mt-1 text-2xl font-bold">Recipe Ratings</h2>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          title="No ratings yet"
          description="Households can rate recipes from the recipe detail page."
        />
      ) : (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">All Rated Recipes</h3>
            <p className="text-sm text-zinc-500">Sorted by most disliked first.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                    <th className="pb-3 pr-4 font-medium">Recipe</th>
                    <th className="pb-3 pr-4 text-center font-medium text-green-600">Love</th>
                    <th className="pb-3 pr-4 text-center font-medium text-zinc-500">Fine</th>
                    <th className="pb-3 pr-4 text-center font-medium text-red-500">Dislike</th>
                    <th className="pb-3 text-center font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => (
                    <tr
                      key={s.recipeId}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/recipes/${s.recipeId}`}
                          className="text-zinc-900 hover:underline dark:text-zinc-100"
                        >
                          {s.recipeName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-center text-green-600">{s.love}</td>
                      <td className="py-3 pr-4 text-center text-zinc-500">{s.fine}</td>
                      <td className="py-3 pr-4 text-center text-red-500">{s.dislike}</td>
                      <td className="py-3 text-center">{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
