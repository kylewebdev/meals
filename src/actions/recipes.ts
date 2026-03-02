'use server';

import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { requireAdmin, requireSession } from '@/lib/auth-utils';
import { eq, sql, sum } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notifyNewRecipe } from '@/lib/notifications';

interface RecipeInput {
  name: string;
  description?: string;
  instructions?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags?: string[];
}

interface IngredientInput {
  name: string;
  quantity?: string;
  unit?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  sortOrder?: number;
}

export async function createRecipe(data: RecipeInput) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  const result = await db
    .insert(recipes)
    .values({
      name,
      description: data.description?.trim() || null,
      instructions: data.instructions?.trim() || null,
      servings: data.servings ?? null,
      prepTimeMinutes: data.prepTimeMinutes ?? null,
      cookTimeMinutes: data.cookTimeMinutes ?? null,
      tags: data.tags ?? null,
      createdBy: auth.data.user.id,
    })
    .returning() as (typeof recipes.$inferSelect)[];
  const recipe = result[0];

  revalidatePath('/recipes');

  // Fire-and-forget notification
  notifyNewRecipe(recipe.id, recipe.name).catch(() => {});

  return { success: true as const, data: recipe };
}

export async function updateRecipe(recipeId: string, data: RecipeInput) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  await db
    .update(recipes)
    .set({
      name,
      description: data.description?.trim() || null,
      instructions: data.instructions?.trim() || null,
      servings: data.servings ?? null,
      prepTimeMinutes: data.prepTimeMinutes ?? null,
      cookTimeMinutes: data.cookTimeMinutes ?? null,
      tags: data.tags ?? null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, recipeId));

  revalidatePath('/recipes');
  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: null };
}

export async function deleteRecipe(recipeId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await db.delete(recipes).where(eq(recipes.id, recipeId));

  revalidatePath('/recipes');
  return { success: true as const, data: null };
}

export async function addIngredient(recipeId: string, data: IngredientInput) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Ingredient name is required' };

  const ingResult = await db
    .insert(recipeIngredients)
    .values({
      recipeId,
      name,
      quantity: data.quantity?.trim() || null,
      unit: data.unit?.trim() || null,
      calories: data.calories ?? null,
      proteinG: data.proteinG ?? null,
      carbsG: data.carbsG ?? null,
      fatG: data.fatG ?? null,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning() as (typeof recipeIngredients.$inferSelect)[];
  const ingredient = ingResult[0];

  await recomputeNutrition(recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: ingredient };
}

export async function updateIngredient(
  ingredientId: string,
  recipeId: string,
  data: IngredientInput,
) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await db
    .update(recipeIngredients)
    .set({
      name: data.name.trim(),
      quantity: data.quantity?.trim() || null,
      unit: data.unit?.trim() || null,
      calories: data.calories ?? null,
      proteinG: data.proteinG ?? null,
      carbsG: data.carbsG ?? null,
      fatG: data.fatG ?? null,
      sortOrder: data.sortOrder ?? 0,
    })
    .where(eq(recipeIngredients.id, ingredientId));

  await recomputeNutrition(recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: null };
}

export async function removeIngredient(ingredientId: string, recipeId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await db.delete(recipeIngredients).where(eq(recipeIngredients.id, ingredientId));

  await recomputeNutrition(recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: null };
}

async function recomputeNutrition(recipeId: string) {
  const ingredients = await db
    .select({
      calories: recipeIngredients.calories,
      proteinG: recipeIngredients.proteinG,
      carbsG: recipeIngredients.carbsG,
      fatG: recipeIngredients.fatG,
    })
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));

  let calories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  for (const ing of ingredients) {
    calories += ing.calories ?? 0;
    proteinG += ing.proteinG ?? 0;
    carbsG += ing.carbsG ?? 0;
    fatG += ing.fatG ?? 0;
  }
  const totals = { calories, proteinG, carbsG, fatG };

  await db
    .update(recipes)
    .set({
      calories: totals.calories || null,
      proteinG: totals.proteinG || null,
      carbsG: totals.carbsG || null,
      fatG: totals.fatG || null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, recipeId));
}
