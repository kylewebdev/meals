import { z } from 'zod';

export const idSchema = z.string().uuid();

export const emailSchema = z.string().email();

export const nameSchema = z.string().min(1).max(255);

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const ratingValueSchema = z.enum(['love', 'fine', 'dislike']);

export const rateRecipeSchema = z.object({
  recipeId: z.string(),
  rating: ratingValueSchema,
  comment: z.string().max(500).optional(),
});
