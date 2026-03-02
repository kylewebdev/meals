import { db } from '@/lib/db';
import { weekOptOuts, weeks } from '@/lib/db/schema';
import { eq, gte, lte, and, lt } from 'drizzle-orm';
import { computeNutrition } from './recipes';

interface ScheduleWeek {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
}

export interface ScheduleContribution {
  id: string;
  householdId: string;
  household: { id: string; name: string };
  recipe: { id: string; name: string } | null;
}

export interface ScheduleSwapDay {
  id: string;
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
  contributions: ScheduleContribution[];
}

export interface ScheduleWeekWithContributions {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
  swapDays: ScheduleSwapDay[];
}

export async function getScheduleWithContributions(
  startDate: Date,
  endDate: Date,
): Promise<ScheduleWeekWithContributions[]> {
  return db.query.weeks.findMany({
    where: and(gte(weeks.startDate, startDate), lte(weeks.startDate, endDate)),
    with: {
      swapDays: {
        with: {
          contributions: {
            columns: { id: true, householdId: true },
            with: {
              household: { columns: { id: true, name: true } },
              recipe: { columns: { id: true, name: true } },
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as Promise<ScheduleWeekWithContributions[]>;
}

export async function getSchedule(startDate?: Date, endDate?: Date): Promise<ScheduleWeek[]> {
  const conditions = [];
  if (startDate) conditions.push(gte(weeks.startDate, startDate));
  if (endDate) conditions.push(lte(weeks.startDate, endDate));

  return db.query.weeks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as Promise<ScheduleWeek[]>;
}

export interface CurrentWeek {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
  isCurrent: boolean;
  swapDays: {
    id: string;
    dayOfWeek: number;
    label: string;
    coversFrom: number;
    coversTo: number;
    location: string | null;
    time: string | null;
    notes: string | null;
    contributions: {
      id: string;
      householdId: string;
      recipeId: string | null;
      dishName: string | null;
      notes: string | null;
      servings: number | null;
      household: { id: string; name: string };
      recipe: {
        id: string;
        name: string;
        calories: number | null;
        proteinG: number | null;
        carbsG: number | null;
        fatG: number | null;
      } | null;
    }[];
  }[];
}

interface RawCurrentWeekRecipe {
  id: string;
  name: string;
  ingredients: { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null }[];
}

interface RawCurrentWeekContribution {
  id: string;
  householdId: string;
  recipeId: string | null;
  dishName: string | null;
  notes: string | null;
  servings: number | null;
  household: { id: string; name: string };
  recipe: RawCurrentWeekRecipe | null;
}

interface RawCurrentWeekSwapDay {
  id: string;
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
  location: string | null;
  time: string | null;
  notes: string | null;
  contributions: RawCurrentWeekContribution[];
}

interface RawCurrentWeek {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
  swapDays: RawCurrentWeekSwapDay[];
}

export async function getCurrentWeek(): Promise<CurrentWeek | undefined> {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const row = await db.query.weeks.findFirst({
    where: and(gte(weeks.startDate, monday), lte(weeks.startDate, sunday)),
    with: {
      swapDays: {
        with: {
          contributions: {
            with: {
              household: { columns: { id: true, name: true } },
              recipe: {
                columns: { id: true, name: true },
                with: {
                  ingredients: {
                    columns: { calories: true, proteinG: true, carbsG: true, fatG: true },
                  },
                },
              },
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
  }) as unknown as RawCurrentWeek | undefined;

  if (!row) {
    // Fall back to the next upcoming week
    const nextRow = await db.query.weeks.findFirst({
      where: gte(weeks.startDate, monday),
      with: {
        swapDays: {
          with: {
            contributions: {
              with: {
                household: { columns: { id: true, name: true } },
                recipe: {
                  columns: { id: true, name: true },
                  with: {
                    ingredients: {
                      columns: { calories: true, proteinG: true, carbsG: true, fatG: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
        },
      },
      orderBy: (w, { asc }) => [asc(w.startDate)],
    }) as unknown as RawCurrentWeek | undefined;

    if (!nextRow) return undefined;

    return {
      ...nextRow,
      isCurrent: false,
      swapDays: nextRow.swapDays.map((sd) => ({
        ...sd,
        contributions: sd.contributions.map((c) => ({
          ...c,
          recipe: c.recipe ? {
            id: c.recipe.id,
            name: c.recipe.name,
            ...computeNutrition(c.recipe.ingredients),
          } : null,
        })),
      })),
    };
  }

  return {
    ...row,
    isCurrent: true,
    swapDays: row.swapDays.map((sd) => ({
      ...sd,
      contributions: sd.contributions.map((c) => ({
        ...c,
        recipe: c.recipe ? {
          id: c.recipe.id,
          name: c.recipe.name,
          ...computeNutrition(c.recipe.ingredients),
        } : null,
      })),
    })),
  };
}

// ─── Opt-out queries ──────────────────────────────────────────

export async function getOptOutStatus(userId: string, weekId: string): Promise<boolean> {
  const record = await db.query.weekOptOuts.findFirst({
    where: and(eq(weekOptOuts.userId, userId), eq(weekOptOuts.weekId, weekId)),
  });
  return !!record;
}

export interface OptOutRecord {
  id: string;
  userId: string;
  weekId: string;
  resetNotified: boolean;
  createdAt: Date;
}

export async function getUserCurrentWeekOptOut(
  userId: string,
): Promise<OptOutRecord | undefined> {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const currentWeek = await db.query.weeks.findFirst({
    where: and(gte(weeks.startDate, monday), lte(weeks.startDate, sunday)),
    columns: { id: true },
  });

  if (!currentWeek) return undefined;

  return db.query.weekOptOuts.findFirst({
    where: and(
      eq(weekOptOuts.userId, userId),
      eq(weekOptOuts.weekId, currentWeek.id),
    ),
  }) as unknown as Promise<OptOutRecord | undefined>;
}

export interface UnnotifiedReset {
  id: string;
  weekId: string;
}

export async function getUnnotifiedResets(userId: string): Promise<UnnotifiedReset[]> {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const results = await db
    .select({
      id: weekOptOuts.id,
      weekId: weekOptOuts.weekId,
    })
    .from(weekOptOuts)
    .innerJoin(weeks, eq(weekOptOuts.weekId, weeks.id))
    .where(
      and(
        eq(weekOptOuts.userId, userId),
        eq(weekOptOuts.resetNotified, false),
        lt(weeks.startDate, monday),
      ),
    );

  return results;
}
