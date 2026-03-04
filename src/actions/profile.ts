'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { isValidMeals } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateMeals(meals: number) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  if (!isValidMeals(meals)) {
    return { success: false as const, error: 'Meals must be between 0 and 3' };
  }

  await db
    .update(user)
    .set({ meals: meals, updatedAt: new Date() })
    .where(eq(user.id, auth.data.user.id));

  revalidatePath('/', 'layout');
  return { success: true as const, data: null };
}

