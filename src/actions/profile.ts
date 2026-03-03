'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { isValidPortions } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updatePortionsPerMeal(portions: number) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  if (!isValidPortions(portions)) {
    return { success: false as const, error: 'Portions must be between 0 and 3' };
  }

  await db
    .update(user)
    .set({ portionsPerMeal: portions, updatedAt: new Date() })
    .where(eq(user.id, auth.data.user.id));

  revalidatePath('/', 'layout');
  return { success: true as const, data: null };
}

