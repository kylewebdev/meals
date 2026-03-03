import { db } from '@/lib/db';
import { recipeComments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface RecipeComment {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; image: string | null };
}

export async function getRecipeComments(recipeId: string): Promise<RecipeComment[]> {
  const rows = await db.query.recipeComments.findMany({
    where: eq(recipeComments.recipeId, recipeId),
    with: {
      author: {
        columns: { id: true, name: true, image: true },
      },
    },
    orderBy: (c, { asc }) => [asc(c.createdAt)],
  }) as unknown as RecipeComment[];

  return rows;
}
