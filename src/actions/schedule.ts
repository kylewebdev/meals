'use server';

import { db } from '@/lib/db';
import { contributions, households, swapDays, swapSettings, weeks } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import {
  computeHouseholdRecipeIndex,
  getEndOfNextMonth,
  getMondaysInRange,
  getSwapDayDefaults,
} from '@/lib/schedule-utils';
import { eq, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteWeek(weekId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await db.delete(weeks).where(eq(weeks.id, weekId));

  revalidatePath('/schedule');
  revalidatePath('/admin/swap-config');
  return { success: true as const, data: null };
}

/**
 * Auto-populate weeks from swap_settings.startDate through end of next month.
 * Creates weeks, swap_days (with recipe assignments), and contributions for
 * every active household on every swap day.
 *
 * Called at the top of /schedule and /dashboard pages.
 */
export async function ensureWeeksExist() {
  const settings = await db.query.swapSettings.findFirst();
  if (!settings) return;

  const s = settings as unknown as {
    id: string;
    startDate: Date;
    swapMode: 'single' | 'dual';
    recipeOrder: string[];
    householdOrder: string[];
    defaultLocation: string | null;
    defaultTime: string | null;
  };

  const target = getEndOfNextMonth();
  const recipeOrder = s.recipeOrder;
  const householdOrder = s.householdOrder;
  const swapDayDefs = getSwapDayDefaults(s.swapMode);
  const swapDaysPerWeek = swapDayDefs.length;

  // Find the latest existing week
  const latestWeek = await db.query.weeks.findMany({
    orderBy: (w, { desc }) => [desc(w.startDate)],
    limit: 1,
  });

  const latestDate = latestWeek.length > 0
    ? new Date(latestWeek[0].startDate)
    : null;

  // Determine which Mondays need creating
  const rangeStart = latestDate
    ? new Date(latestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    : new Date(s.startDate);

  const mondays = getMondaysInRange(rangeStart, target);
  if (mondays.length === 0) return;

  // Get all household IDs to create contributions
  const allHouseholds = householdOrder.length > 0
    ? householdOrder
    : (await db.select({ id: households.id }).from(households)).map((h) => h.id);

  let didCreate = false;

  for (const monday of mondays) {
    const weekResult = await db
      .insert(weeks)
      .values({ startDate: monday, swapMode: s.swapMode })
      .returning() as (typeof weeks.$inferSelect)[];
    const week = weekResult[0];

    for (let sdIdx = 0; sdIdx < swapDayDefs.length; sdIdx++) {
      const def = swapDayDefs[sdIdx];

      const sdResult = await db
        .insert(swapDays)
        .values({
          weekId: week.id,
          dayOfWeek: def.dayOfWeek,
          label: def.label,
          coversFrom: def.coversFrom,
          coversTo: def.coversTo,
          location: s.defaultLocation,
          time: s.defaultTime,
        })
        .returning() as (typeof swapDays.$inferSelect)[];
      const swapDay = sdResult[0];

      // Create a contribution for every household with per-household recipe
      for (let hhIdx = 0; hhIdx < allHouseholds.length; hhIdx++) {
        const recipeIdx = computeHouseholdRecipeIndex(
          s.startDate, monday, swapDaysPerWeek, sdIdx, hhIdx, recipeOrder.length,
        );
        const recipeId = recipeIdx >= 0 ? recipeOrder[recipeIdx] : null;

        await db.insert(contributions).values({
          weekId: week.id,
          householdId: allHouseholds[hhIdx],
          swapDayId: swapDay.id,
          recipeId,
        });
      }
    }

    didCreate = true;
  }

  if (didCreate) {
    revalidatePath('/schedule');
    revalidatePath('/dashboard');
  }
}

/**
 * Re-assign recipes on future weeks when the recipe order changes.
 */
export async function recalculateWeekAssignments() {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const settings = await db.query.swapSettings.findFirst();
  if (!settings) {
    return { success: false as const, error: 'Settings not configured' };
  }

  const s = settings as unknown as {
    id: string;
    startDate: Date;
    swapMode: 'single' | 'dual';
    recipeOrder: string[];
    householdOrder: string[];
  };

  const swapDayDefs = getSwapDayDefaults(s.swapMode);
  const swapDaysPerWeek = swapDayDefs.length;

  // Build household index map
  const allHouseholds = s.householdOrder.length > 0
    ? s.householdOrder
    : (await db.select({ id: households.id }).from(households)).map((h) => h.id);
  const hhIndexMap = new Map(allHouseholds.map((id, idx) => [id, idx]));

  // Get all future weeks (start date >= today's Monday)
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const futureWeeks = await db.query.weeks.findMany({
    where: gte(weeks.startDate, monday),
    with: {
      swapDays: {
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
        with: {
          contributions: {
            columns: { id: true, householdId: true },
          },
        },
      },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as {
    id: string;
    startDate: Date;
    swapDays: {
      id: string;
      dayOfWeek: number;
      contributions: { id: string; householdId: string }[];
    }[];
  }[];

  for (const week of futureWeeks) {
    for (let sdIdx = 0; sdIdx < week.swapDays.length; sdIdx++) {
      const sd = week.swapDays[sdIdx];

      for (const contrib of sd.contributions) {
        const hhIdx = hhIndexMap.get(contrib.householdId) ?? 0;
        const recipeIdx = computeHouseholdRecipeIndex(
          s.startDate, week.startDate, swapDaysPerWeek, sdIdx, hhIdx, s.recipeOrder.length,
        );
        const recipeId = recipeIdx >= 0 ? s.recipeOrder[recipeIdx] : null;

        await db
          .update(contributions)
          .set({ recipeId, updatedAt: new Date() })
          .where(eq(contributions.id, contrib.id));
      }
    }
  }

  revalidatePath('/schedule');
  revalidatePath('/admin/swap-config');
  revalidatePath('/dashboard');
  return { success: true as const, data: null };
}
