'use server';

import { db } from '@/lib/db';
import { swapDays } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateSwapDayInfo(
  swapDayId: string,
  data: {
    location?: string;
    time?: string;
    notes?: string;
  },
) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const [existing] = await db
    .select({ weekId: swapDays.weekId })
    .from(swapDays)
    .where(eq(swapDays.id, swapDayId))
    .limit(1);

  if (!existing) {
    return { success: false as const, error: 'Swap day not found' };
  }

  await db
    .update(swapDays)
    .set({
      location: data.location?.trim() || null,
      time: data.time?.trim() || null,
      notes: data.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(swapDays.id, swapDayId));

  revalidatePath(`/week/${existing.weekId}`);
  revalidatePath('/dashboard');
  return { success: true as const, data: null };
}
