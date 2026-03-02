import { db } from '@/lib/db';
import { contributions, swapDays, user, weekOptOuts, weeks } from '@/lib/db/schema';
import { and, eq, count, isNull } from 'drizzle-orm';

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
