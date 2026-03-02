import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

export async function getRecipes(): Promise<RecipeListItem[]> {
  return db.query.recipes.findMany({
    where: eq(recipes.status, 'approved'),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  }) as unknown as Promise<RecipeListItem[]>;
}

export async function getRecipe(id: string): Promise<RecipeDetail | undefined> {
  return db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      ingredients: {
        orderBy: (ri, { asc }) => [asc(ri.sortOrder)],
      },
      creator: {
        columns: { id: true, name: true },
      },
    },
  }) as unknown as Promise<RecipeDetail | undefined>;
}

export async function getPendingRecipes(): Promise<RecipeListItem[]> {
  return db.query.recipes.findMany({
    where: eq(recipes.status, 'pending'),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    orderBy: (r, { asc }) => [asc(r.createdAt)],
  }) as unknown as Promise<RecipeListItem[]>;
}

export async function getMyRecipes(userId: string): Promise<RecipeListItem[]> {
  return db.query.recipes.findMany({
    where: eq(recipes.createdBy, userId),
    columns: {
      id: true,
      name: true,
      description: true,
      servings: true,
      prepTimeMinutes: true,
      cookTimeMinutes: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      tags: true,
      status: true,
      createdAt: true,
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  }) as unknown as Promise<RecipeListItem[]>;
}
