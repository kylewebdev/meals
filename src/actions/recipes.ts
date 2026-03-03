'use server';

import { db } from '@/lib/db';
import { recipes, recipeIngredients, contributions, swapSettings } from '@/lib/db/schema';
import { requireAdmin, requireSession } from '@/lib/auth-utils';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notifyNewRecipe, notifyRecipeReviewed } from '@/lib/notifications';
import { recalculateWeekAssignments } from '@/actions/schedule';
import { deleteR2Object } from '@/lib/r2';

interface RecipeInput {
  name: string;
  description?: string;
  instructions?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags?: string[];
  imageUrl?: string;
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
  const status = isAdmin ? 'approved' : 'submitted';

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
      imageUrl: data.imageUrl ?? null,
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

  // Any member can edit non-approved recipes; only admin can edit approved
  if (!isAdmin) {
    const [recipe] = await db
      .select({ status: recipes.status })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe) {
      return { success: false as const, error: 'Recipe not found' };
    }
    if (recipe.status === 'approved') {
      return { success: false as const, error: 'Cannot edit an approved recipe' };
    }
  }

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  const updateFields: Record<string, unknown> = {
    name,
    description: data.description?.trim() || null,
    instructions: data.instructions?.trim() || null,
    servings: data.servings ?? null,
    prepTimeMinutes: data.prepTimeMinutes ?? null,
    cookTimeMinutes: data.cookTimeMinutes ?? null,
    tags: data.tags ?? null,
    imageUrl: data.imageUrl ?? null,
    updatedAt: new Date(),
  };

  await db
    .update(recipes)
    .set(updateFields)
    .where(eq(recipes.id, recipeId));

  revalidateRecipePaths(recipeId);
  return { success: true as const, data: null };
}

export async function deleteRecipe(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';
  const userId = auth.data.user.id;

  // Fetch recipe for permission check + image cleanup
  const [recipeRow] = await db
    .select({
      createdBy: recipes.createdBy,
      status: recipes.status,
      imageUrl: recipes.imageUrl,
    })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipeRow) {
    return { success: false as const, error: 'Recipe not found' };
  }

  // Creator-only for delete (communal editing ≠ communal deletion)
  if (!isAdmin) {
    if (recipeRow.createdBy !== userId) {
      return { success: false as const, error: 'Not authorized to delete this recipe' };
    }
    if (recipeRow.status === 'approved') {
      return { success: false as const, error: 'Cannot delete an approved recipe' };
    }
  }

  // Clear recipe from any contributions to avoid FK violation
  await db
    .update(contributions)
    .set({ recipeId: null, updatedAt: new Date() })
    .where(eq(contributions.recipeId, recipeId));

  // Remove from swap settings recipe order if present
  let wasInRotation = false;
  const settings = await db.query.swapSettings.findFirst();
  if (settings) {
    const s = settings as unknown as { id: string; recipeOrder: string[] };
    const filtered = s.recipeOrder.filter((id) => id !== recipeId);
    if (filtered.length !== s.recipeOrder.length) {
      wasInRotation = true;
      await db
        .update(swapSettings)
        .set({ recipeOrder: filtered })
        .where(eq(swapSettings.id, s.id));
    }
  }

  // Clean up R2 image if present
  if (recipeRow.imageUrl) {
    deleteR2Object(recipeRow.imageUrl).catch(() => {});
  }

  // Delete the recipe (ingredients cascade)
  await db.delete(recipes).where(eq(recipes.id, recipeId));

  // Recalculate future week assignments if recipe was in the rotation
  if (wasInRotation) {
    await recalculateWeekAssignments();
  }

  revalidatePath('/recipes');
  revalidatePath('/schedule');
  revalidatePath('/admin/rotation');
  return { success: true as const, data: null };
}

export async function requireRecipeAccess(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';
  if (isAdmin) return auth;

  // Any member can modify non-approved recipes
  const [recipe] = await db
    .select({ status: recipes.status })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) {
    return { success: false as const, error: 'Recipe not found' };
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

export async function revalidateRecipePaths(recipeId: string) {
  revalidatePath('/recipes');
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/admin/recipe-review');
  revalidatePath('/recipes/mine');
}

export async function reviewRecipe(
  recipeId: string,
  action: 'approve' | 'send_back' | 'demote',
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

  if (action === 'approve') {
    if (recipe.status !== 'pending_review') {
      return { success: false as const, error: 'Recipe is not pending review' };
    }
    await db
      .update(recipes)
      .set({
        status: 'approved',
        adminFeedback: null,
        adminFeedbackAt: null,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId));

    notifyNewRecipe(recipeId, recipe.name).catch(() => {});
    notifyRecipeReviewed(recipeId, recipe.name, recipe.createdBy, true).catch(() => {});
  } else {
    const requiredStatus = action === 'send_back' ? 'pending_review' : 'approved';
    if (recipe.status !== requiredStatus) {
      return { success: false as const, error: `Recipe is not ${requiredStatus.replace('_', ' ')}` };
    }
    const trimmed = feedback?.trim() || null;
    await db
      .update(recipes)
      .set({
        status: 'submitted',
        adminFeedback: trimmed,
        adminFeedbackAt: trimmed ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId));

    notifyRecipeReviewed(recipeId, recipe.name, recipe.createdBy, false, feedback).catch(() => {});
  }

  revalidateRecipePaths(recipeId);
  return { success: true as const, data: null };
}

export async function resetAllRecipes() {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Fetch all recipes to clean up R2 images
  const allRecipes = await db
    .select({ id: recipes.id, imageUrl: recipes.imageUrl })
    .from(recipes);

  // Nullify recipe references in contributions
  await db
    .update(contributions)
    .set({ recipeId: null, updatedAt: new Date() })
    .where(sql`${contributions.recipeId} IS NOT NULL`);

  // Clear recipe order from swap settings
  const settings = await db.query.swapSettings.findFirst();
  if (settings) {
    await db
      .update(swapSettings)
      .set({ recipeOrder: [], updatedAt: new Date() })
      .where(eq(swapSettings.id, (settings as unknown as { id: string }).id));
  }

  // Delete R2 images in the background
  for (const r of allRecipes) {
    if (r.imageUrl) {
      deleteR2Object(r.imageUrl).catch(() => {});
    }
  }

  // Delete all recipes (ingredients, ratings, comments cascade)
  await db.delete(recipes);

  // Recalculate week assignments
  await recalculateWeekAssignments();

  revalidatePath('/recipes');
  revalidatePath('/schedule');
  revalidatePath('/admin/rotation');
  revalidatePath('/admin/recipe-ratings');

  return { success: true as const, data: { deleted: allRecipes.length } };
}

export async function flagForReview(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const [recipe] = await db
    .select({ status: recipes.status })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { success: false as const, error: 'Recipe not found' };
  if (recipe.status !== 'submitted') {
    return { success: false as const, error: 'Only workshop recipes can be flagged for review' };
  }

  await db
    .update(recipes)
    .set({
      status: 'pending_review',
      adminFeedback: null,
      adminFeedbackAt: null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, recipeId));

  revalidateRecipePaths(recipeId);
  return { success: true as const, data: null };
}
