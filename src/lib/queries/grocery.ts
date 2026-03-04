import { db } from '@/lib/db';
import { contributions, groceryItems, groceryLists, recipeIngredients, recipes, households, user } from '@/lib/db/schema';
import { countDistinct, eq, isNotNull } from 'drizzle-orm';
import { getHeadcount } from './contributions';
import { getMealCount } from '@/lib/schedule-utils';
import { scaleQuantity } from '@/lib/quantity-utils';

export interface GroceryItem {
  id: string;
  ingredientName: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
  sortOrder: number;
}

export interface GroceryList {
  id: string;
  contributionId: string;
  items: GroceryItem[];
}

interface ContributionWithRecipe {
  id: string;
  recipeId: string | null;
  servings: number | null;
  swapDay: { coversFrom: number; coversTo: number };
  recipe: {
    servings: number | null;
    ingredients: {
      name: string;
      quantity: string | null;
      unit: string | null;
      sortOrder: number;
    }[];
  } | null;
}

async function buildScaledItems(contribution: ContributionWithRecipe) {
  const recipe = contribution.recipe;
  if (!recipe || !recipe.ingredients.length) return [];

  const recipeServings = recipe.servings;
  let scaleFactor = 1;

  if (recipeServings && recipeServings > 0) {
    const [headcount, householdResult] = await Promise.all([
      getHeadcount(),
      db.select({ count: countDistinct(user.householdId) })
        .from(user)
        .where(isNotNull(user.householdId)),
    ]);
    const totalMeals = getMealCount(
      headcount,
      contribution.swapDay.coversFrom,
      contribution.swapDay.coversTo,
    );
    const householdCount = householdResult[0]?.count || 1;
    const perHouseholdMeals = Math.ceil(totalMeals / householdCount);
    scaleFactor = perHouseholdMeals / recipeServings;
  }

  return recipe.ingredients
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((ing, i) => ({
      ingredientName: ing.name,
      quantity: ing.quantity ? scaleQuantity(ing.quantity, scaleFactor) : null,
      unit: ing.unit,
      sortOrder: i,
    }));
}

export async function getGroceryList(contributionId: string): Promise<GroceryList | null> {
  // Check the contribution exists and has a recipe
  const contribution = await db.query.contributions.findFirst({
    where: eq(contributions.id, contributionId),
    with: {
      swapDay: { columns: { coversFrom: true, coversTo: true } },
      recipe: {
        columns: { servings: true },
        with: {
          ingredients: {
            columns: { name: true, quantity: true, unit: true, sortOrder: true },
          },
        },
      },
    },
  }) as unknown as ContributionWithRecipe | undefined;

  if (!contribution || !contribution.recipeId || !contribution.recipe) return null;

  // Try to fetch existing list
  const existing = await db.query.groceryLists.findFirst({
    where: eq(groceryLists.contributionId, contributionId),
    with: {
      items: true,
    },
  }) as unknown as (GroceryList | undefined);

  if (existing) return existing;

  // Auto-create the list
  const scaledItems = await buildScaledItems(contribution);

  const [list] = await db.insert(groceryLists).values({
    contributionId,
  }).returning() as (typeof groceryLists.$inferSelect)[];

  if (scaledItems.length > 0) {
    await db.insert(groceryItems).values(
      scaledItems.map((item) => ({
        listId: list.id,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        sortOrder: item.sortOrder,
      })),
    );
  }

  // Fetch the newly created list with items
  const created = await db.query.groceryLists.findFirst({
    where: eq(groceryLists.id, list.id),
    with: { items: true },
  }) as unknown as GroceryList;

  return created;
}

export async function resyncGroceryList(listId: string): Promise<GroceryList | null> {
  // Get the list with its contribution context
  const list = await db.query.groceryLists.findFirst({
    where: eq(groceryLists.id, listId),
  }) as unknown as { id: string; contributionId: string } | undefined;

  if (!list) return null;

  const contribution = await db.query.contributions.findFirst({
    where: eq(contributions.id, list.contributionId),
    with: {
      swapDay: { columns: { coversFrom: true, coversTo: true } },
      recipe: {
        columns: { servings: true },
        with: {
          ingredients: {
            columns: { name: true, quantity: true, unit: true, sortOrder: true },
          },
        },
      },
    },
  }) as unknown as ContributionWithRecipe | undefined;

  if (!contribution || !contribution.recipe) return null;

  // Delete old items
  await db.delete(groceryItems).where(eq(groceryItems.listId, listId));

  // Regenerate
  const scaledItems = await buildScaledItems(contribution);

  if (scaledItems.length > 0) {
    await db.insert(groceryItems).values(
      scaledItems.map((item) => ({
        listId,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        sortOrder: item.sortOrder,
      })),
    );
  }

  const updated = await db.query.groceryLists.findFirst({
    where: eq(groceryLists.id, listId),
    with: { items: true },
  }) as unknown as GroceryList;

  return updated;
}
