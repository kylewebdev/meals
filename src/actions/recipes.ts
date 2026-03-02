'use server';

import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { requireAdmin, requireSession } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notifyNewRecipe, notifyRecipeReviewed } from '@/lib/notifications';

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
  const auth = await requireSession();
  if (!auth.success) return auth;

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  const isAdmin = auth.data.user.role === 'admin';
  const status = isAdmin ? 'approved' : 'pending';

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
      status,
      createdBy: auth.data.user.id,
    })
    .returning() as (typeof recipes.$inferSelect)[];
  const recipe = result[0];

  revalidatePath('/recipes');

  if (isAdmin) {
    notifyNewRecipe(recipe.id, recipe.name).catch(() => {});
  }

  return { success: true as const, data: recipe };
}

export async function updateRecipe(recipeId: string, data: RecipeInput) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';
  const userId = auth.data.user.id;

  // Check permissions: admin can edit any, creator can edit pending/rejected
  let currentStatus: string | undefined;
  if (!isAdmin) {
    const [recipe] = await db
      .select({ createdBy: recipes.createdBy, status: recipes.status })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe || recipe.createdBy !== userId) {
      return { success: false as const, error: 'Not authorized to edit this recipe' };
    }
    if (recipe.status === 'approved') {
      return { success: false as const, error: 'Cannot edit an approved recipe' };
    }
    currentStatus = recipe.status;
  }

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  // If a member edits a rejected recipe, reset to pending
  const updateFields: Record<string, unknown> = {
    name,
    description: data.description?.trim() || null,
    instructions: data.instructions?.trim() || null,
    servings: data.servings ?? null,
    prepTimeMinutes: data.prepTimeMinutes ?? null,
    cookTimeMinutes: data.cookTimeMinutes ?? null,
    tags: data.tags ?? null,
    updatedAt: new Date(),
  };

  if (!isAdmin && currentStatus === 'rejected') {
    updateFields.status = 'pending';
  }

  await db
    .update(recipes)
    .set(updateFields)
    .where(eq(recipes.id, recipeId));

  revalidatePath('/recipes');
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/recipes/mine');
  return { success: true as const, data: null };
}

export async function deleteRecipe(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';
  const userId = auth.data.user.id;

  if (!isAdmin) {
    const [recipe] = await db
      .select({ createdBy: recipes.createdBy, status: recipes.status })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe || recipe.createdBy !== userId) {
      return { success: false as const, error: 'Not authorized to delete this recipe' };
    }
    if (recipe.status === 'approved') {
      return { success: false as const, error: 'Cannot delete an approved recipe' };
    }
  }

  await db.delete(recipes).where(eq(recipes.id, recipeId));

  revalidatePath('/recipes');
  return { success: true as const, data: null };
}

async function requireRecipeAccess(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';
  if (isAdmin) return auth;

  const [recipe] = await db
    .select({ createdBy: recipes.createdBy, status: recipes.status })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe || recipe.createdBy !== auth.data.user.id) {
    return { success: false as const, error: 'Not authorized' };
  }
  if (recipe.status === 'approved') {
    return { success: false as const, error: 'Cannot modify an approved recipe' };
  }
  return auth;
}

export async function addIngredient(recipeId: string, data: IngredientInput) {
  const auth = await requireRecipeAccess(recipeId);
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

  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: ingredient };
}

export async function updateIngredient(
  ingredientId: string,
  recipeId: string,
  data: IngredientInput,
) {
  const auth = await requireRecipeAccess(recipeId);
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

  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: null };
}

export async function removeIngredient(ingredientId: string, recipeId: string) {
  const auth = await requireRecipeAccess(recipeId);
  if (!auth.success) return auth;

  await db.delete(recipeIngredients).where(eq(recipeIngredients.id, ingredientId));

  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: null };
}

export async function reviewRecipe(
  recipeId: string,
  action: 'approve' | 'reject',
  feedback?: string,
) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const [recipe] = await db
    .select({ createdBy: recipes.createdBy, name: recipes.name, status: recipes.status })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { success: false as const, error: 'Recipe not found' };
  if (recipe.status !== 'pending') {
    return { success: false as const, error: 'Recipe is not pending review' };
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  await db
    .update(recipes)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(recipes.id, recipeId));

  revalidatePath('/recipes');
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/admin/recipe-review');
  revalidatePath('/recipes/mine');

  notifyRecipeReviewed(
    recipeId,
    recipe.name,
    recipe.createdBy,
    action === 'approve',
    feedback,
  ).catch(() => {});

  if (action === 'approve') {
    notifyNewRecipe(recipeId, recipe.name).catch(() => {});
  }

  return { success: true as const, data: null };
}
