import { db } from '@/lib/db';
import { contributions, swapDays, user, weekOptOuts, weeks } from '@/lib/db/schema';
import { and, eq, count, isNull, inArray, gte } from 'drizzle-orm';

export interface ContributionItem {
  id: string;
  weekId: string;
  householdId: string;
  swapDayId: string;
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
}

export interface SwapDayWithContributions {
  id: string;
  weekId: string;
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
  location: string | null;
  time: string | null;
  notes: string | null;
  contributions: ContributionItem[];
}

export interface WeekWithContributions {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
  swapDays: SwapDayWithContributions[];
}

export async function getWeekContributions(weekId: string): Promise<SwapDayWithContributions[]> {
  const days = await db.query.swapDays.findMany({
    where: eq(swapDays.weekId, weekId),
    with: {
      contributions: {
        with: {
          household: { columns: { id: true, name: true } },
          recipe: {
            columns: {
              id: true,
              name: true,
              calories: true,
              proteinG: true,
              carbsG: true,
              fatG: true,
            },
          },
        },
      },
    },
    orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
  }) as unknown as SwapDayWithContributions[];

  return days;
}

export async function getWeekWithContributions(
  weekId: string,
): Promise<WeekWithContributions | undefined> {
  return db.query.weeks.findFirst({
    where: eq(weeks.id, weekId),
    with: {
      swapDays: {
        with: {
          contributions: {
            with: {
              household: { columns: { id: true, name: true } },
              recipe: {
                columns: {
                  id: true,
                  name: true,
                  calories: true,
                  proteinG: true,
                  carbsG: true,
                  fatG: true,
                },
              },
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
  }) as unknown as Promise<WeekWithContributions | undefined>;
}

export async function getHouseholdContribution(
  weekId: string,
  householdId: string,
): Promise<ContributionItem[]> {
  return db.query.contributions.findMany({
    where: and(
      eq(contributions.weekId, weekId),
      eq(contributions.householdId, householdId),
    ),
    with: {
      household: { columns: { id: true, name: true } },
      recipe: {
        columns: {
          id: true,
          name: true,
          calories: true,
          proteinG: true,
          carbsG: true,
          fatG: true,
        },
      },
    },
  }) as unknown as Promise<ContributionItem[]>;
}

export interface UpcomingSwapDay {
  id: string;
  weekId: string;
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
  weekStartDate: Date;
  weekStatus: string;
  hasContribution: boolean;
}

export async function getUpcomingSwapDays(householdId: string): Promise<UpcomingSwapDay[]> {
  // Get active + upcoming weeks
  const activeWeeks = await db.query.weeks.findMany({
    where: inArray(weeks.status, ['active', 'upcoming']),
    with: {
      swapDays: {
        with: {
          contributions: {
            columns: { id: true, householdId: true },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as {
    id: string;
    startDate: Date;
    status: string;
    swapDays: {
      id: string;
      dayOfWeek: number;
      label: string;
      coversFrom: number;
      coversTo: number;
      contributions: { id: string; householdId: string }[];
    }[];
  }[];

  const result: UpcomingSwapDay[] = [];
  for (const week of activeWeeks) {
    for (const sd of week.swapDays) {
      result.push({
        id: sd.id,
        weekId: week.id,
        dayOfWeek: sd.dayOfWeek,
        label: sd.label,
        coversFrom: sd.coversFrom,
        coversTo: sd.coversTo,
        weekStartDate: week.startDate,
        weekStatus: week.status,
        hasContribution: sd.contributions.some((c) => c.householdId === householdId),
      });
    }
  }

  return result;
}

export async function getHeadcount(weekId?: string): Promise<number> {
  if (!weekId) {
    const [result] = await db.select({ count: count() }).from(user);
    return result?.count ?? 0;
  }

  const [result] = await db
    .select({ count: count() })
    .from(user)
    .leftJoin(
      weekOptOuts,
      and(eq(weekOptOuts.userId, user.id), eq(weekOptOuts.weekId, weekId)),
    )
    .where(isNull(weekOptOuts.id));

  return result?.count ?? 0;
}
