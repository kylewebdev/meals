'use server';

import { db } from '@/lib/db';
import { contributions, recipes } from '@/lib/db/schema';
import { requireSession, isHouseholdMember } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notifyContributionPosted } from '@/lib/notifications';

export async function setContribution(
  weekId: string,
  swapDayId: string,
  recipeId?: string,
  dishName?: string,
  notes?: string,
  servings?: number,
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const householdId = auth.data.user.householdId;
  if (!householdId) {
    return { success: false as const, error: 'You must belong to a household' };
  }

  // Verify user belongs to this household
  const isMember = await isHouseholdMember(householdId, auth.data.user.id);
  if (!isMember && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Not authorized' };
  }

  // Resolve dish name from recipe if provided
  let resolvedDishName = dishName?.trim() || null;
  if (recipeId) {
    const [recipe] = await db
      .select({ name: recipes.name })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);
    if (!recipe) {
      return { success: false as const, error: 'Recipe not found' };
    }
    if (!resolvedDishName) resolvedDishName = recipe.name;
  }

  if (!recipeId && !resolvedDishName) {
    return { success: false as const, error: 'Must specify a recipe or dish name' };
  }

  const result = await db
    .insert(contributions)
    .values({
      weekId,
      householdId,
      swapDayId,
      recipeId: recipeId || null,
      dishName: resolvedDishName,
      notes: notes?.trim() || null,
      servings: servings ?? null,
    })
    .returning() as (typeof contributions.$inferSelect)[];

  revalidatePath(`/week/${weekId}`);
  revalidatePath('/dashboard');

  notifyContributionPosted(weekId, householdId).catch(() => {});

  return { success: true as const, data: result[0] };
}

export async function updateContribution(
  contributionId: string,
  data: {
    recipeId?: string | null;
    dishName?: string;
    notes?: string;
    servings?: number;
  },
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  // Get the contribution to check ownership
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

  // Check authorization
  const isMember = auth.data.user.householdId === existing.householdId;
  if (!isMember && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Not authorized' };
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

export async function removeContribution(contributionId: string) {
  const auth = await requireSession();
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

  const isMember = auth.data.user.householdId === existing.householdId;
  if (!isMember && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Not authorized' };
  }

  await db.delete(contributions).where(eq(contributions.id, contributionId));

  revalidatePath(`/week/${existing.weekId}`);
  revalidatePath('/dashboard');
  return { success: true as const, data: null };
}
