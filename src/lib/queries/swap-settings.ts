import { db } from '@/lib/db';
import { households, recipes, swapSettings } from '@/lib/db/schema';
import { getNextMonday } from '@/lib/schedule-utils';
import { eq, inArray } from 'drizzle-orm';

export interface SwapSettingsRow {
  id: string;
  startDate: Date;
  swapMode: string;
  recipeOrder: string[];
  householdOrder: string[];
  householdOrderMode: string;
  defaultLocation: string | null;
  defaultTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSwapSettings(): Promise<SwapSettingsRow | null> {
  const row = await db.query.swapSettings.findFirst();
  return (row as unknown as SwapSettingsRow) ?? null;
}

export async function getOrCreateSwapSettings(): Promise<SwapSettingsRow> {
  const existing = await db.query.swapSettings.findFirst();
  if (existing) return existing as unknown as SwapSettingsRow;

  const result = await db
    .insert(swapSettings)
    .values({ startDate: getNextMonday() })
    .returning() as (typeof swapSettings.$inferSelect)[];

  return result[0] as unknown as SwapSettingsRow;
}

export interface OrderedRecipe {
  id: string;
  name: string;
  servings: number | null;
}

export async function getApprovedRecipesInOrder(
  recipeOrder: string[],
): Promise<OrderedRecipe[]> {
  if (recipeOrder.length === 0) return [];

  const rows = await db
    .select({ id: recipes.id, name: recipes.name, servings: recipes.servings })
    .from(recipes)
    .where(inArray(recipes.id, recipeOrder));

  // Return in the specified order, filtering out any removed/unapproved
  const map = new Map(rows.map((r) => [r.id, r]));
  return recipeOrder.filter((id) => map.has(id)).map((id) => map.get(id)!);
}

export interface OrderedHousehold {
  id: string;
  name: string;
}

export async function getHouseholdsInOrder(
  householdOrder: string[],
): Promise<OrderedHousehold[]> {
  if (householdOrder.length === 0) return [];

  const rows = await db
    .select({ id: households.id, name: households.name })
    .from(households)
    .where(inArray(households.id, householdOrder));

  const map = new Map(rows.map((h) => [h.id, h]));
  return householdOrder.filter((id) => map.has(id)).map((id) => map.get(id)!);
}

export async function getAllHouseholds(): Promise<OrderedHousehold[]> {
  return db
    .select({ id: households.id, name: households.name })
    .from(households)
    .orderBy(households.name);
}

export async function getAllApprovedRecipes(): Promise<OrderedRecipe[]> {
  return db
    .select({ id: recipes.id, name: recipes.name, servings: recipes.servings })
    .from(recipes)
    .where(eq(recipes.status, 'approved'))
    .orderBy(recipes.name);
}
