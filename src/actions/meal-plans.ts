'use server';

import { db } from '@/lib/db';
import { mealPlanEntries, recipes } from '@/lib/db/schema';
import { requireSession, isCookingHousehold } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notifyMealPlanPosted } from '@/lib/notifications';

export async function setMealPlanEntry(
  weekId: string,
  dayOfWeek: number,
  mealType: 'lunch' | 'dinner',
  recipeId: string,
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isCooking = await isCookingHousehold(weekId, auth.data.user.id);
  if (!isCooking && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Only the cooking household can edit meal plans' };
  }

  // Get recipe name
  const [recipe] = await db
    .select({ name: recipes.name })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) {
    return { success: false as const, error: 'Recipe not found' };
  }

  const entryResult = await db
    .insert(mealPlanEntries)
    .values({
      weekId,
      dayOfWeek,
      mealType,
      name: recipe.name,
      recipeId,
    })
    .returning() as (typeof mealPlanEntries.$inferSelect)[];
  const entry = entryResult[0];

  revalidatePath(`/week/${weekId}`);

  // Notify other households
  if (auth.data.user.householdId) {
    notifyMealPlanPosted(weekId, auth.data.user.householdId).catch(() => {});
  }

  return { success: true as const, data: entry };
}

export async function removeMealPlanEntry(entryId: string, weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isCooking = await isCookingHousehold(weekId, auth.data.user.id);
  if (!isCooking && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Only the cooking household can edit meal plans' };
  }

  await db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, entryId));

  revalidatePath(`/week/${weekId}`);
  return { success: true as const, data: null };
}

export async function updateModification(
  entryId: string,
  weekId: string,
  data: {
    notes?: string;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
  },
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isCooking = await isCookingHousehold(weekId, auth.data.user.id);
  if (!isCooking && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Only the cooking household can edit meal plans' };
  }

  await db
    .update(mealPlanEntries)
    .set({
      isModified: true,
      modificationNotes: data.notes?.trim() || null,
      modifiedCalories: data.calories ?? null,
      modifiedProteinG: data.proteinG ?? null,
      modifiedCarbsG: data.carbsG ?? null,
      modifiedFatG: data.fatG ?? null,
    })
    .where(eq(mealPlanEntries.id, entryId));

  revalidatePath(`/week/${weekId}`);
  return { success: true as const, data: null };
}

export async function clearModification(entryId: string, weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isCooking = await isCookingHousehold(weekId, auth.data.user.id);
  if (!isCooking && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Only the cooking household can edit meal plans' };
  }

  await db
    .update(mealPlanEntries)
    .set({
      isModified: false,
      modificationNotes: null,
      modifiedCalories: null,
      modifiedProteinG: null,
      modifiedCarbsG: null,
      modifiedFatG: null,
    })
    .where(eq(mealPlanEntries.id, entryId));

  revalidatePath(`/week/${weekId}`);
  return { success: true as const, data: null };
}
