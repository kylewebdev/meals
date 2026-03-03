'use server';

import { z } from 'zod';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { recipes } from '@/lib/db/schema';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { requireSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const uploadSchema = z.object({
  recipeId: z.string().uuid(),
  fileType: z.string().refine((t) => t in ALLOWED_TYPES, 'Unsupported file type'),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File too large (max 5 MB)'),
});

export async function getUploadUrl(input: {
  recipeId: string;
  fileType: string;
  fileSize: number;
}) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { recipeId, fileType } = parsed.data;
  const isAdmin = auth.data.user.role === 'admin';

  // Permission check: admin can always upload, others only for non-approved
  if (!isAdmin) {
    const [recipe] = await db
      .select({ status: recipes.status })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe) return { success: false as const, error: 'Recipe not found' };
    if (recipe.status === 'approved') {
      return { success: false as const, error: 'Cannot modify an approved recipe' };
    }
  }

  const ext = ALLOWED_TYPES[fileType];
  const key = `recipes/${recipeId}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: fileType,
    ContentLength: parsed.data.fileSize,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { success: true as const, data: { uploadUrl, publicUrl } };
}

export async function updateRecipeImage(recipeId: string, imageUrl: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(recipes)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(recipes.id, recipeId));

  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/recipes');
  return { success: true as const, data: null };
}

export async function removeRecipeImage(recipeId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const [recipe] = await db
    .select({ imageUrl: recipes.imageUrl })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { success: false as const, error: 'Recipe not found' };

  // Delete from R2 if the URL is on our domain
  if (recipe.imageUrl?.startsWith(R2_PUBLIC_URL)) {
    const key = recipe.imageUrl.slice(R2_PUBLIC_URL.length + 1); // strip domain + "/"
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  }

  await db
    .update(recipes)
    .set({ imageUrl: null, updatedAt: new Date() })
    .where(eq(recipes.id, recipeId));

  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/recipes');
  return { success: true as const, data: null };
}
