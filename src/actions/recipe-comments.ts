'use server';

import { db } from '@/lib/db';
import { recipeComments, recipes } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { notifyRecipeComment } from '@/lib/notifications';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
});

export async function addComment(recipeId: string, body: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const parsed = commentSchema.safeParse({ body });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const [recipe] = await db
    .select({ status: recipes.status, createdBy: recipes.createdBy, name: recipes.name })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { success: false as const, error: 'Recipe not found' };
  if (recipe.status === 'approved') {
    return { success: false as const, error: 'Cannot comment on approved recipes' };
  }

  const result = await db
    .insert(recipeComments)
    .values({
      recipeId,
      userId: auth.data.user.id,
      body: parsed.data.body.trim(),
    })
    .returning() as (typeof recipeComments.$inferSelect)[];

  // Notify recipe creator + prior commenters (deduplicated, excluding commenter)
  const priorComments = await db
    .select({ userId: recipeComments.userId })
    .from(recipeComments)
    .where(and(
      eq(recipeComments.recipeId, recipeId),
      ne(recipeComments.userId, auth.data.user.id),
    ));

  notifyRecipeComment(
    recipeId,
    recipe.name,
    recipe.createdBy,
    auth.data.user.id,
    auth.data.user.name ?? 'Someone',
    priorComments.map((c) => c.userId),
  ).catch(() => {});

  revalidatePath(`/recipes/${recipeId}`);
  return { success: true as const, data: result[0] };
}

export async function deleteComment(commentId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';

  const [comment] = await db
    .select({ userId: recipeComments.userId, recipeId: recipeComments.recipeId })
    .from(recipeComments)
    .where(eq(recipeComments.id, commentId))
    .limit(1);

  if (!comment) return { success: false as const, error: 'Comment not found' };

  if (!isAdmin && comment.userId !== auth.data.user.id) {
    return { success: false as const, error: 'Not authorized to delete this comment' };
  }

  await db.delete(recipeComments).where(eq(recipeComments.id, commentId));

  revalidatePath(`/recipes/${comment.recipeId}`);
  return { success: true as const, data: null };
}
