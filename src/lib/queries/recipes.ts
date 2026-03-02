import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
  status: string;
  createdAt: Date;
}

export interface RecipeDetail {
  id: string;
  name: string;
  description: string | null;
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

interface RawRecipeWithIngredients {
  id: string;
  name: string;
  description: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  tags: string[] | null;
  status: string;
  createdAt: Date;
  ingredients: IngredientNutrition[];
}

function toRecipeListItem(r: RawRecipeWithIngredients): RecipeListItem {
  const nutrition = computeNutrition(r.ingredients);
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    servings: r.servings,
    prepTimeMinutes: r.prepTimeMinutes,
    cookTimeMinutes: r.cookTimeMinutes,
    ...nutrition,
    tags: r.tags,
    status: r.status,
    createdAt: r.createdAt,
  };
}

export async function getRecipes(): Promise<RecipeListItem[]> {
  const rows = await db.query.recipes.findMany({
    where: eq(recipes.status, 'approved'),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    with: {
      ingredients: {
        columns: { calories: true, proteinG: true, carbsG: true, fatG: true },
      },
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  }) as unknown as RawRecipeWithIngredients[];

  return rows.map(toRecipeListItem);
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

export async function getPendingRecipes(): Promise<RecipeListItem[]> {
  const rows = await db.query.recipes.findMany({
    where: eq(recipes.status, 'pending'),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    with: {
      ingredients: {
        columns: { calories: true, proteinG: true, carbsG: true, fatG: true },
      },
    },
    orderBy: (r, { asc }) => [asc(r.createdAt)],
  }) as unknown as RawRecipeWithIngredients[];

  return rows.map(toRecipeListItem);
}

export async function getMyRecipes(userId: string): Promise<RecipeListItem[]> {
  const rows = await db.query.recipes.findMany({
    where: eq(recipes.createdBy, userId),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    with: {
      ingredients: {
        columns: { calories: true, proteinG: true, carbsG: true, fatG: true },
      },
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  }) as unknown as RawRecipeWithIngredients[];

  return rows.map(toRecipeListItem);
}
