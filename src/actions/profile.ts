'use server';

import { db } from '@/lib/db';
import { user, weekOptOuts } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function optOutOfWeek(weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .insert(weekOptOuts)
    .values({ userId: auth.data.user.id, weekId })
    .onConflictDoNothing();

  revalidatePath('/');
  return { success: true as const, data: null };
}

export async function optBackIn(weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .delete(weekOptOuts)
    .where(
      and(
        eq(weekOptOuts.userId, auth.data.user.id),
        eq(weekOptOuts.weekId, weekId),
      ),
    );

  revalidatePath('/');
  return { success: true as const, data: null };
}

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

