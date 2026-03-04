import { z } from 'zod';

export function isValidMeals(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 3;
}

export const ratingValueSchema = z.enum(['love', 'fine', 'dislike']);

export const rateRecipeSchema = z.object({
  recipeId: z.string(),
  rating: ratingValueSchema,
  comment: z.string().max(500).optional(),
});

export const PASSWORD_RULES = [
  { label: 'At least 10 characters', test: (pw: string) => pw.length >= 10 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /\d/.test(pw) },
];

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors = PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
  return { valid: errors.length === 0, errors };
}
