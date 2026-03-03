'use server';

import { z } from 'zod';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { recipes } from '@/lib/db/schema';
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL, deleteR2Object } from '@/lib/r2';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/upload-constants';
import { requireRecipeAccess, revalidateRecipePaths } from '@/actions/recipes';

const uploadSchema = z.object({
  recipeId: z.string().uuid(),
  fileType: z.string().refine((t) => t in ALLOWED_IMAGE_TYPES, 'Unsupported file type'),
  fileSize: z.number().max(MAX_IMAGE_SIZE, 'File too large (max 10 MB)'),
});

export async function getUploadUrl(input: {
  recipeId: string;
  fileType: string;
  fileSize: number;
}) {
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { recipeId, fileType } = parsed.data;

  if (!process.env.R2_ACCESS_KEY_ID) {
    return { success: false as const, error: 'Image uploads are not configured' };
  }

  const auth = await requireRecipeAccess(recipeId);
  if (!auth.success) return auth;

  const ext = ALLOWED_IMAGE_TYPES[fileType];
  const key = `recipes/${recipeId}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { success: true as const, data: { uploadUrl, publicUrl } };
}

export async function updateRecipeImage(recipeId: string, imageUrl: string) {
  const auth = await requireRecipeAccess(recipeId);
  if (!auth.success) return auth;

  // Fetch old image URL so we can clean up the previous R2 object
  const [existing] = await db
    .select({ imageUrl: recipes.imageUrl })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  await db
    .update(recipes)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(recipes.id, recipeId));

  // Clean up old image (fire-and-forget)
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
    deleteR2Object(existing.imageUrl).catch(() => {});
  }

  revalidateRecipePaths(recipeId);
  return { success: true as const, data: null };
}

export async function removeRecipeImage(recipeId: string) {
  const auth = await requireRecipeAccess(recipeId);
  if (!auth.success) return auth;

  const [recipe] = await db
    .select({ imageUrl: recipes.imageUrl })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { success: false as const, error: 'Recipe not found' };

  await db
    .update(recipes)
    .set({ imageUrl: null, updatedAt: new Date() })
    .where(eq(recipes.id, recipeId));

  // Delete from R2 (fire-and-forget)
  if (recipe.imageUrl) {
    deleteR2Object(recipe.imageUrl).catch(() => {});
  }

  revalidateRecipePaths(recipeId);
  return { success: true as const, data: null };
}
