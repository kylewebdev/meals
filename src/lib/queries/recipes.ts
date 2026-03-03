import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { and, eq, inArray, sql, count } from 'drizzle-orm';

type IngredientNutrition = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

export function computeNutrition(ingredients: IngredientNutrition[]) {
  let calories = 0, proteinG = 0, carbsG = 0, fatG = 0;
  for (const ing of ingredients) {
    calories += ing.calories ?? 0;
    proteinG += ing.proteinG ?? 0;
    carbsG += ing.carbsG ?? 0;
    fatG += ing.fatG ?? 0;
  }
  return {
    calories: calories || null,
    proteinG: proteinG || null,
    carbsG: carbsG || null,
    fatG: fatG || null,
  };
}

export interface RecipeListItem {
  id: string;
  name: string;
  description: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  tags: string[] | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
}

export interface RecipeDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  instructions: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  tags: string[] | null;
  status: string;
  adminFeedback: string | null;
  adminFeedbackAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: {
    id: string;
    name: string;
    quantity: string | null;
    unit: string | null;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    sortOrder: number;
  }[];
  creator: { id: string; name: string };
}

// SQL subqueries for aggregated nutrition — avoids fetching all ingredient rows
const nutritionSubquery = {
  calories: sql<number | null>`(SELECT SUM(${recipeIngredients.calories}) FROM ${recipeIngredients} WHERE ${recipeIngredients.recipeId} = ${recipes.id})`,
  proteinG: sql<number | null>`(SELECT SUM(${recipeIngredients.proteinG}) FROM ${recipeIngredients} WHERE ${recipeIngredients.recipeId} = ${recipes.id})`,
  carbsG: sql<number | null>`(SELECT SUM(${recipeIngredients.carbsG}) FROM ${recipeIngredients} WHERE ${recipeIngredients.recipeId} = ${recipes.id})`,
  fatG: sql<number | null>`(SELECT SUM(${recipeIngredients.fatG}) FROM ${recipeIngredients} WHERE ${recipeIngredients.recipeId} = ${recipes.id})`,
};

const recipeListSelect = {
  id: recipes.id,
  name: recipes.name,
  description: recipes.description,
  imageUrl: recipes.imageUrl,
  servings: recipes.servings,
  prepTimeMinutes: recipes.prepTimeMinutes,
  cookTimeMinutes: recipes.cookTimeMinutes,
  tags: recipes.tags,
  status: recipes.status,
  createdAt: recipes.createdAt,
  calories: nutritionSubquery.calories,
  proteinG: nutritionSubquery.proteinG,
  carbsG: nutritionSubquery.carbsG,
  fatG: nutritionSubquery.fatG,
};

export async function getRecipes(): Promise<RecipeListItem[]> {
  return db
    .select(recipeListSelect)
    .from(recipes)
    .where(eq(recipes.status, 'approved'))
    .orderBy(sql`${recipes.createdAt} DESC`) as unknown as Promise<RecipeListItem[]>;
}

export async function getRecipe(id: string): Promise<RecipeDetail | undefined> {
  const row = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      ingredients: {
        orderBy: (ri, { asc }) => [asc(ri.sortOrder)],
      },
      creator: {
        columns: { id: true, name: true },
      },
    },
  }) as unknown as (Omit<RecipeDetail, 'calories' | 'proteinG' | 'carbsG' | 'fatG'> & {
    ingredients: RecipeDetail['ingredients'];
  }) | undefined;

  if (!row) return undefined;

  const nutrition = computeNutrition(row.ingredients);
  return { ...row, ...nutrition };
}

export async function getPendingReviewRecipes(): Promise<RecipeListItem[]> {
  return db
    .select(recipeListSelect)
    .from(recipes)
    .where(eq(recipes.status, 'pending_review'))
    .orderBy(sql`${recipes.createdAt} ASC`) as unknown as Promise<RecipeListItem[]>;
}

export async function getWorkshopRecipes(): Promise<RecipeListItem[]> {
  return db
    .select(recipeListSelect)
    .from(recipes)
    .where(inArray(recipes.status, ['submitted', 'pending_review']))
    .orderBy(sql`${recipes.createdAt} DESC`) as unknown as Promise<RecipeListItem[]>;
}

export async function getMyRecipes(userId: string): Promise<RecipeListItem[]> {
  return db
    .select(recipeListSelect)
    .from(recipes)
    .where(eq(recipes.createdBy, userId))
    .orderBy(sql`${recipes.createdAt} DESC`) as unknown as Promise<RecipeListItem[]>;
}

export interface RecipeNavCounts {
  recipes: number;
  workshop: number;
  mine: number;
  pendingReview?: number;
}

export async function getRecipeNavCounts(
  userId: string,
  includeAdmin = false,
): Promise<RecipeNavCounts> {
  const [recipesCount, workshopCount, mineCount, pendingReviewCount] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(eq(recipes.status, 'approved')).then((r) => r[0]?.count ?? 0),
    db.select({ count: count() }).from(recipes).where(inArray(recipes.status, ['submitted', 'pending_review'])).then((r) => r[0]?.count ?? 0),
    db.select({ count: count() }).from(recipes).where(eq(recipes.createdBy, userId)).then((r) => r[0]?.count ?? 0),
    includeAdmin
      ? db.select({ count: count() }).from(recipes).where(eq(recipes.status, 'pending_review')).then((r) => r[0]?.count ?? 0)
      : Promise.resolve(undefined),
  ]);
  return { recipes: recipesCount, workshop: workshopCount, mine: mineCount, pendingReview: pendingReviewCount };
}
