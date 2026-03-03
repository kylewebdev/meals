import { z } from 'zod';

export function isValidPortions(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 3;
}

export const ratingValueSchema = z.enum(['love', 'fine', 'dislike']);

export const rateRecipeSchema = z.object({
  recipeId: z.string(),
  rating: ratingValueSchema,
  comment: z.string().max(500).optional(),
});
