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
import { eq, gte, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Auto-populate weeks from swap_settings.startDate through end of next month.
 * Creates weeks, swap_days (with recipe assignments), and contributions for
 * every active household on every swap day.
 *
 * Called at the top of the /up-next page.
 */
export async function ensureWeeksExist() {
  const settings = await db.query.swapSettings.findFirst();
  if (!settings) return;

  const s = settings as unknown as {
    id: string;
    startDate: Date;
    recipeOrder: string[];
    householdOrder: string[];
    defaultLocation: string | null;
    defaultTime: string | null;
  };

  const target = getEndOfNextMonth();
  const recipeOrder = s.recipeOrder;
  const householdOrder = s.householdOrder;
  const swapDayDefs = getSwapDayDefaults();
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
    // Skip if a week already exists for this Monday (prevents duplicates on concurrent calls)
    const existing = await db.query.weeks.findFirst({
      where: and(eq(weeks.startDate, monday)),
      columns: { id: true },
    });
    if (existing) continue;

    const weekResult = await db
      .insert(weeks)
      .values({ startDate: monday })
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

      // Create contributions for every household in one batch
      const contribValues = allHouseholds.map((hhId, hhIdx) => {
        const recipeIdx = computeHouseholdRecipeIndex(
          s.startDate, monday, swapDaysPerWeek, sdIdx, hhIdx, recipeOrder.length,
        );
        return {
          weekId: week.id,
          householdId: hhId,
          swapDayId: swapDay.id,
          recipeId: recipeIdx >= 0 ? recipeOrder[recipeIdx] : null,
        };
      });

      if (contribValues.length > 0) {
        await db.insert(contributions).values(contribValues);
      }
    }

    didCreate = true;
  }

  if (didCreate) {
    revalidatePath('/up-next');
    revalidatePath('/up-next');
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
    recipeOrder: string[];
    householdOrder: string[];
  };

  const swapDayDefs = getSwapDayDefaults();
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

  // Group contributions by their new recipeId for batch updates
  const updatesByRecipe = new Map<string | null, string[]>();

  for (const week of futureWeeks) {
    for (let sdIdx = 0; sdIdx < week.swapDays.length; sdIdx++) {
      const sd = week.swapDays[sdIdx];

      for (const contrib of sd.contributions) {
        const hhIdx = hhIndexMap.get(contrib.householdId) ?? 0;
        const recipeIdx = computeHouseholdRecipeIndex(
          s.startDate, week.startDate, swapDaysPerWeek, sdIdx, hhIdx, s.recipeOrder.length,
        );
        const recipeId = recipeIdx >= 0 ? s.recipeOrder[recipeIdx] : null;

        const ids = updatesByRecipe.get(recipeId) ?? [];
        ids.push(contrib.id);
        updatesByRecipe.set(recipeId, ids);
      }
    }
  }

  const updatedAt = new Date();
  for (const [recipeId, ids] of updatesByRecipe) {
    await db
      .update(contributions)
      .set({ recipeId, updatedAt })
      .where(inArray(contributions.id, ids));
  }

  revalidatePath('/up-next');
  revalidatePath('/admin/rotation');
  revalidatePath('/up-next');
  return { success: true as const, data: null };
}
