'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updatePortionsPerMeal(portions: number) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  if (!Number.isInteger(portions) || portions < 1 || portions > 3) {
    return { success: false as const, error: 'Portions must be 1, 2, or 3' };
  }

  await db
    .update(user)
    .set({ portionsPerMeal: portions, updatedAt: new Date() })
    .where(eq(user.id, auth.data.user.id));

  revalidatePath('/profile');
  return { success: true as const, data: null };
}

