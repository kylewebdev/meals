'use server';

import { db } from '@/lib/db';
import { weeks } from '@/lib/db/schema';
import { requireSession, isCookingHousehold } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updatePickupInfo(
  weekId: string,
  data: {
    location?: string;
    times?: string;
    notes?: string;
  },
) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isCooking = await isCookingHousehold(weekId, auth.data.user.id);
  if (!isCooking && auth.data.user.role !== 'admin') {
    return { success: false as const, error: 'Only the cooking household can update pickup info' };
  }

  await db
    .update(weeks)
    .set({
      pickupLocation: data.location?.trim() || null,
      pickupTimes: data.times?.trim() || null,
      pickupNotes: data.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(weeks.id, weekId));

  revalidatePath(`/week/${weekId}`);
  revalidatePath('/dashboard');
  return { success: true as const, data: null };
}
