import { db } from '@/lib/db';
import { recipeRatings, recipes, households, user } from '@/lib/db/schema';
import type { RatingValue } from '@/lib/rating-styles';
import { eq, sql, count, desc } from 'drizzle-orm';

export interface HouseholdRating {
  id: string;
  rating: RatingValue;
  comment: string | null;
  householdName: string;
  raterName: string;
  householdId: string;
}

export interface RatingAggregate {
  love: number;
  fine: number;
  dislike: number;
  total: number;
}

export interface RecipeRatingsResult {
  aggregate: RatingAggregate;
  ratings: HouseholdRating[];
}

export async function getRecipeRatings(recipeId: string): Promise<RecipeRatingsResult> {
  const rows = await db
    .select({
      id: recipeRatings.id,
      rating: recipeRatings.rating,
      comment: recipeRatings.comment,
      householdId: recipeRatings.householdId,
      householdName: households.name,
      raterName: user.name,
    })
    .from(recipeRatings)
    .innerJoin(households, eq(recipeRatings.householdId, households.id))
    .innerJoin(user, eq(recipeRatings.ratedBy, user.id))
    .where(eq(recipeRatings.recipeId, recipeId));

  const aggregate: RatingAggregate = { love: 0, fine: 0, dislike: 0, total: rows.length };
  for (const row of rows) {
    aggregate[row.rating]++;
  }

  return {
    aggregate,
    ratings: rows as HouseholdRating[],
  };
}

export interface RecipeRatingSummary {
  recipeId: string;
  recipeName: string;
  love: number;
  fine: number;
  dislike: number;
  total: number;
}

export async function getRecipeRatingSummaries(): Promise<RecipeRatingSummary[]> {
  const rows = await db
    .select({
      recipeId: recipeRatings.recipeId,
      recipeName: recipes.name,
      love: count(sql`CASE WHEN ${recipeRatings.rating} = 'love' THEN 1 END`),
      fine: count(sql`CASE WHEN ${recipeRatings.rating} = 'fine' THEN 1 END`),
      dislike: count(sql`CASE WHEN ${recipeRatings.rating} = 'dislike' THEN 1 END`),
      total: count(),
    })
    .from(recipeRatings)
    .innerJoin(recipes, eq(recipeRatings.recipeId, recipes.id))
    .groupBy(recipeRatings.recipeId, recipes.name)
    .orderBy(sql`count(CASE WHEN ${recipeRatings.rating} = 'dislike' THEN 1 END) DESC`);

  return rows.map((r) => ({
    recipeId: r.recipeId,
    recipeName: r.recipeName,
    love: Number(r.love),
    fine: Number(r.fine),
    dislike: Number(r.dislike),
    total: Number(r.total),
  }));
}

export interface HouseholdReview {
  id: string;
  recipeId: string;
  recipeName: string;
  rating: RatingValue;
  comment: string | null;
}

export async function getHouseholdReviews(householdId: string): Promise<HouseholdReview[]> {
  const rows = await db
    .select({
      id: recipeRatings.id,
      recipeId: recipeRatings.recipeId,
      recipeName: recipes.name,
      rating: recipeRatings.rating,
      comment: recipeRatings.comment,
    })
    .from(recipeRatings)
    .innerJoin(recipes, eq(recipeRatings.recipeId, recipes.id))
    .where(eq(recipeRatings.householdId, householdId))
    .orderBy(desc(recipeRatings.createdAt));

  return rows as HouseholdReview[];
}
