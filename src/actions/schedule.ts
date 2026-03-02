'use server';

import { db } from '@/lib/db';
import { households, weeks } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { assignHouseholdsToWeeks, getNextMonday } from '@/lib/schedule-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateRotationOrder(orderedHouseholdIds: string[]) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  for (let i = 0; i < orderedHouseholdIds.length; i++) {
    await db
      .update(households)
      .set({ rotationPosition: i, updatedAt: new Date() })
      .where(eq(households.id, orderedHouseholdIds[i]));
  }

  revalidatePath('/schedule');
  revalidatePath('/admin/rotation');
  return { success: true as const, data: null };
}

export async function deleteWeek(weekId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Check for meal plan entries
  const { mealPlanEntries } = await import('@/lib/db/schema');
  const entries = await db
    .select({ id: mealPlanEntries.id })
    .from(mealPlanEntries)
    .where(eq(mealPlanEntries.weekId, weekId))
    .limit(1);

  if (entries.length > 0) {
    return { success: false as const, error: 'Cannot delete a week that has meal plan entries. Remove them first.' };
  }

  await db.delete(weeks).where(eq(weeks.id, weekId));

  revalidatePath('/schedule');
  revalidatePath('/admin/rotation');
  return { success: true as const, data: null };
}

export async function generateWeeks(count: number) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (count < 1 || count > 52) {
    return { success: false as const, error: 'Count must be between 1 and 52' };
  }

  const allHouseholds = await db
    .select({ id: households.id, rotationPosition: households.rotationPosition })
    .from(households)
    .orderBy(households.rotationPosition);

  if (allHouseholds.length === 0) {
    return { success: false as const, error: 'No households exist' };
  }

  // Find the latest week to start after it, or use next Monday
  const existingWeeks = await db.query.weeks.findMany({
    orderBy: (w, { desc }) => [desc(w.startDate)],
    limit: 1,
  });

  let startDate: Date;
  if (existingWeeks.length > 0) {
    startDate = new Date(existingWeeks[0].startDate);
    startDate.setDate(startDate.getDate() + 7);
  } else {
    startDate = getNextMonday();
  }

  const assignments = assignHouseholdsToWeeks(allHouseholds, startDate, count);

  for (const assignment of assignments) {
    await db.insert(weeks).values({
      startDate: assignment.startDate,
      householdId: assignment.householdId,
    });
  }

  revalidatePath('/schedule');
  return { success: true as const, data: { generated: count } };
}
