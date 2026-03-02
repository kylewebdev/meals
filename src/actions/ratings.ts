'use server';

import { db } from '@/lib/db';
import { recipeRatings } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { rateRecipeSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function rateRecipe(
  recipeId: string,
  rating: 'love' | 'fine' | 'dislike',
  comment?: string,
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const householdId = auth.data.user.householdId;
  if (!householdId) {
    return { success: false as const, error: 'You must belong to a household to rate recipes' };
  }

  const parsed = rateRecipeSchema.safeParse({ recipeId, rating, comment });
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid rating input' };
  }

  const result = await db
    .insert(recipeRatings)
    .values({
      recipeId: parsed.data.recipeId,
      householdId,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
      ratedBy: auth.data.user.id,
    })
    .onConflictDoUpdate({
      target: [recipeRatings.recipeId, recipeRatings.householdId],
      set: {
        rating: parsed.data.rating,
        comment: parsed.data.comment?.trim() || null,
        ratedBy: auth.data.user.id,
        updatedAt: new Date(),
      },
    })
    .returning() as (typeof recipeRatings.$inferSelect)[];

  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/recipes');
  revalidatePath('/admin/recipe-ratings');

  return { success: true as const, data: result[0] };
}
