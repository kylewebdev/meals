'use server';

import { db } from '@/lib/db';
import { contributions, swapDays, weeks } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { getNextMonday, getSwapDayDefaults } from '@/lib/schedule-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteWeek(weekId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Check for contributions
  const existing = await db
    .select({ id: contributions.id })
    .from(contributions)
    .where(eq(contributions.weekId, weekId))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false as const,
      error: 'Cannot delete a week that has contributions. Remove them first.',
    };
  }

  await db.delete(weeks).where(eq(weeks.id, weekId));

  revalidatePath('/schedule');
  revalidatePath('/admin/swap-config');
  return { success: true as const, data: null };
}

export async function generateWeeks(count: number, swapMode: 'single' | 'dual' = 'single') {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (count < 1 || count > 52) {
    return { success: false as const, error: 'Count must be between 1 and 52' };
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

  const defaults = getSwapDayDefaults(swapMode);

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);

    const weekResult = await db
      .insert(weeks)
      .values({ startDate: weekStart, swapMode })
      .returning() as (typeof weeks.$inferSelect)[];
    const week = weekResult[0];

    for (const def of defaults) {
      await db.insert(swapDays).values({
        weekId: week.id,
        dayOfWeek: def.dayOfWeek,
        label: def.label,
        coversFrom: def.coversFrom,
        coversTo: def.coversTo,
      });
    }
  }

  revalidatePath('/schedule');
  revalidatePath('/admin/swap-config');
  return { success: true as const, data: { generated: count } };
}

export async function updateWeekSwapMode(weekId: string, swapMode: 'single' | 'dual') {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Check for existing contributions
  const existing = await db
    .select({ id: contributions.id })
    .from(contributions)
    .where(eq(contributions.weekId, weekId))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false as const,
      error: 'Cannot change swap mode for a week with existing contributions.',
    };
  }

  // Update the week's swap mode
  await db
    .update(weeks)
    .set({ swapMode, updatedAt: new Date() })
    .where(eq(weeks.id, weekId));

  // Delete old swap days and create new ones
  await db.delete(swapDays).where(eq(swapDays.weekId, weekId));

  const defaults = getSwapDayDefaults(swapMode);
  for (const def of defaults) {
    await db.insert(swapDays).values({
      weekId,
      dayOfWeek: def.dayOfWeek,
      label: def.label,
      coversFrom: def.coversFrom,
      coversTo: def.coversTo,
    });
  }

  revalidatePath('/schedule');
  revalidatePath('/admin/swap-config');
  revalidatePath(`/week/${weekId}`);
  return { success: true as const, data: null };
}
