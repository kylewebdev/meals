import { db } from '@/lib/db';
import { contributions, extraPeople, swapDays, user, weeks } from '@/lib/db/schema';
import { eq, sum, isNotNull, gte, lt } from 'drizzle-orm';
import { getThisMonday } from '@/lib/schedule-utils';
import { computeNutrition } from './recipes';

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
  swapDays: SwapDayWithContributions[];
}

interface RawRecipeWithIngredients {
  id: string;
  name: string;
  ingredients: { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null }[];
}

interface RawContribution {
  id: string;
  weekId: string;
  householdId: string;
  swapDayId: string;
  recipeId: string | null;
  dishName: string | null;
  notes: string | null;
  servings: number | null;
  household: { id: string; name: string };
  recipe: RawRecipeWithIngredients | null;
}

function mapContribution(c: RawContribution): ContributionItem {
  return {
    ...c,
    recipe: c.recipe ? {
      id: c.recipe.id,
      name: c.recipe.name,
      ...computeNutrition(c.recipe.ingredients),
    } : null,
  };
}

const recipeWithIngredients = {
  columns: { id: true, name: true } as const,
  with: {
    ingredients: {
      columns: { calories: true, proteinG: true, carbsG: true, fatG: true } as const,
    },
  },
};

export async function getWeekWithContributions(
  weekId: string,
): Promise<WeekWithContributions | undefined> {
  const row = await db.query.weeks.findFirst({
    where: eq(weeks.id, weekId),
    with: {
      swapDays: {
        with: {
          contributions: {
            with: {
              household: { columns: { id: true, name: true } },
              recipe: recipeWithIngredients,
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
  }) as unknown as (Omit<WeekWithContributions, 'swapDays'> & {
    swapDays: (Omit<SwapDayWithContributions, 'contributions'> & {
      contributions: RawContribution[];
    })[];
  }) | undefined;

  if (!row) return undefined;

  return {
    ...row,
    swapDays: row.swapDays.map((d) => ({
      ...d,
      contributions: d.contributions.map(mapContribution),
    })),
  };
}

export interface UpcomingSwapDay {
  id: string;
  weekId: string;
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
  weekStartDate: Date;
  assignedRecipe: { id: string; name: string } | null;
}

export async function getUpcomingSwapDays(householdId: string): Promise<UpcomingSwapDay[]> {
  const monday = getThisMonday();
  // Get current + future weeks with contributions filtered to this household
  const activeWeeks = await db.query.weeks.findMany({
    where: gte(weeks.startDate, monday),
    with: {
      swapDays: {
        with: {
          contributions: {
            where: eq(contributions.householdId, householdId),
            with: {
              recipe: { columns: { id: true, name: true } },
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as {
    id: string;
    startDate: Date;
    swapDays: {
      id: string;
      dayOfWeek: number;
      label: string;
      coversFrom: number;
      coversTo: number;
      contributions: {
        recipe: { id: string; name: string } | null;
      }[];
    }[];
  }[];

  const result: UpcomingSwapDay[] = [];
  for (const week of activeWeeks) {
    for (const sd of week.swapDays) {
      const myContribution = sd.contributions[0];
      result.push({
        id: sd.id,
        weekId: week.id,
        dayOfWeek: sd.dayOfWeek,
        label: sd.label,
        coversFrom: sd.coversFrom,
        coversTo: sd.coversTo,
        weekStartDate: week.startDate,
        assignedRecipe: myContribution?.recipe ?? null,
      });
    }
  }

  return result;
}

export interface RecentCook {
  contributionId: string;
  weekId: string;
  weekStartDate: Date;
  swapDayLabel: string;
  dayOfWeek: number;
  recipeName: string | null;
  recipeId: string | null;
}

export async function getRecentCooksForHousehold(
  householdId: string,
  limit = 3,
): Promise<RecentCook[]> {
  const monday = getThisMonday();
  const pastWeeks = await db.query.weeks.findMany({
    where: lt(weeks.startDate, monday),
    with: {
      swapDays: {
        with: {
          contributions: {
            where: eq(contributions.householdId, householdId),
            with: {
              recipe: { columns: { id: true, name: true } },
            },
          },
        },
        orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
      },
    },
    orderBy: (w, { desc }) => [desc(w.startDate)],
    limit: limit + 2,
  }) as unknown as {
    id: string;
    startDate: Date;
    status: string;
    swapDays: {
      id: string;
      dayOfWeek: number;
      label: string;
      contributions: {
        id: string;
        recipe: { id: string; name: string } | null;
      }[];
    }[];
  }[];

  const result: RecentCook[] = [];
  for (const week of pastWeeks) {
    for (const sd of week.swapDays) {
      const contrib = sd.contributions[0];
      if (!contrib) continue;
      result.push({
        contributionId: contrib.id,
        weekId: week.id,
        weekStartDate: week.startDate,
        swapDayLabel: sd.label,
        dayOfWeek: sd.dayOfWeek,
        recipeName: contrib.recipe?.name ?? null,
        recipeId: contrib.recipe?.id ?? null,
      });
      if (result.length >= limit) break;
    }
    if (result.length >= limit) break;
  }

  return result;
}

export async function getHeadcount(): Promise<number> {
  const [[userResult], [epResult]] = await Promise.all([
    db.select({ total: sum(user.meals) }).from(user)
      .where(isNotNull(user.householdId)),
    db.select({ total: sum(extraPeople.meals) }).from(extraPeople),
  ]);
  return (Number(userResult?.total) || 0) + (Number(epResult?.total) || 0);
}
