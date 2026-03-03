'use server';

import { db } from '@/lib/db';
import { households, recipes, swapSettings } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateSwapSettings(data: {
  startDate?: string;
  householdOrderMode?: 'fixed' | 'random';
  defaultLocation?: string;
  defaultTime?: string;
}) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const existing = await db.query.swapSettings.findFirst();
  if (!existing) {
    return { success: false as const, error: 'Settings not found. Initialize first.' };
  }

  await db
    .update(swapSettings)
    .set({
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.householdOrderMode !== undefined && {
        householdOrderMode: data.householdOrderMode,
      }),
      ...(data.defaultLocation !== undefined && {
        defaultLocation: data.defaultLocation || null,
      }),
      ...(data.defaultTime !== undefined && {
        defaultTime: data.defaultTime || null,
      }),
      updatedAt: new Date(),
    })
    .where(eq(swapSettings.id, existing.id));

  revalidatePath('/admin/swap-config');
  revalidatePath('/schedule');
  return { success: true as const, data: null };
}

export async function updateRecipeOrder(recipeIds: string[]) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Validate all IDs are approved recipes
  if (recipeIds.length > 0) {
    const approved = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(inArray(recipes.id, recipeIds));

    const approvedSet = new Set(approved.map((r) => r.id));
    const invalid = recipeIds.filter((id) => !approvedSet.has(id));
    if (invalid.length > 0) {
      return { success: false as const, error: `Invalid recipe IDs: ${invalid.join(', ')}` };
    }
  }

  const existing = await db.query.swapSettings.findFirst();
  if (!existing) {
    return { success: false as const, error: 'Settings not found' };
  }

  await db
    .update(swapSettings)
    .set({ recipeOrder: recipeIds, updatedAt: new Date() })
    .where(eq(swapSettings.id, existing.id));

  revalidatePath('/admin/swap-config');
  return { success: true as const, data: null };
}

export async function updateHouseholdOrder(householdIds: string[]) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Validate all IDs exist
  if (householdIds.length > 0) {
    const existing = await db
      .select({ id: households.id })
      .from(households)
      .where(inArray(households.id, householdIds));

    const existingSet = new Set(existing.map((h) => h.id));
    const invalid = householdIds.filter((id) => !existingSet.has(id));
    if (invalid.length > 0) {
      return { success: false as const, error: `Invalid household IDs: ${invalid.join(', ')}` };
    }
  }

  const settings = await db.query.swapSettings.findFirst();
  if (!settings) {
    return { success: false as const, error: 'Settings not found' };
  }

  await db
    .update(swapSettings)
    .set({ householdOrder: householdIds, updatedAt: new Date() })
    .where(eq(swapSettings.id, settings.id));

  revalidatePath('/admin/swap-config');
  return { success: true as const, data: null };
}

export async function shuffleHouseholdOrder() {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const settings = await db.query.swapSettings.findFirst();
  if (!settings) {
    return { success: false as const, error: 'Settings not found' };
  }

  const order = [...(settings as { householdOrder: string[] }).householdOrder];
  // Fisher-Yates shuffle
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  await db
    .update(swapSettings)
    .set({ householdOrder: order, updatedAt: new Date() })
    .where(eq(swapSettings.id, settings.id));

  revalidatePath('/admin/swap-config');
  return { success: true as const, data: order };
}
