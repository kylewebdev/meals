'use server';

import { db } from '@/lib/db';
import { contributions, recipes } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateContribution(
  contributionId: string,
  data: {
    recipeId?: string | null;
    dishName?: string;
    notes?: string;
    servings?: number;
  },
) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const [existing] = await db
    .select({
      householdId: contributions.householdId,
      weekId: contributions.weekId,
    })
    .from(contributions)
    .where(eq(contributions.id, contributionId))
    .limit(1);

  if (!existing) {
    return { success: false as const, error: 'Contribution not found' };
  }

  // Resolve dish name if changing recipe
  let dishName = data.dishName?.trim() || undefined;
  if (data.recipeId) {
    const [recipe] = await db
      .select({ name: recipes.name })
      .from(recipes)
      .where(eq(recipes.id, data.recipeId))
      .limit(1);
    if (!recipe) {
      return { success: false as const, error: 'Recipe not found' };
    }
    if (!dishName) dishName = recipe.name;
  }

  await db
    .update(contributions)
    .set({
      ...(data.recipeId !== undefined && { recipeId: data.recipeId }),
      ...(dishName !== undefined && { dishName }),
      ...(data.notes !== undefined && { notes: data.notes.trim() || null }),
      ...(data.servings !== undefined && { servings: data.servings }),
      updatedAt: new Date(),
    })
    .where(eq(contributions.id, contributionId));

  revalidatePath(`/week/${existing.weekId}`);
  revalidatePath('/dashboard');
  return { success: true as const, data: null };
}
