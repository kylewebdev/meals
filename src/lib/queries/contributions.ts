import { db } from '@/lib/db';
import { contributions, extraPeople, swapDays, user, weeks } from '@/lib/db/schema';
import { and, eq, count, inArray, gte, sum, isNotNull } from 'drizzle-orm';
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
  swapMode: string;
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

export async function getWeekContributions(weekId: string): Promise<SwapDayWithContributions[]> {
  const days = await db.query.swapDays.findMany({
    where: eq(swapDays.weekId, weekId),
    with: {
      contributions: {
        with: {
          household: { columns: { id: true, name: true } },
          recipe: recipeWithIngredients,
        },
      },
    },
    orderBy: (sd, { asc }) => [asc(sd.dayOfWeek)],
  }) as unknown as (Omit<SwapDayWithContributions, 'contributions'> & {
    contributions: RawContribution[];
  })[];

  return days.map((d) => ({
    ...d,
    contributions: d.contributions.map(mapContribution),
  }));
}

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

export async function getHouseholdContribution(
  weekId: string,
  householdId: string,
): Promise<ContributionItem[]> {
  const rows = await db.query.contributions.findMany({
    where: and(
      eq(contributions.weekId, weekId),
      eq(contributions.householdId, householdId),
    ),
    with: {
      household: { columns: { id: true, name: true } },
      recipe: recipeWithIngredients,
    },
  }) as unknown as RawContribution[];

  return rows.map(mapContribution);
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
  assignedRecipe: { id: string; name: string } | null;
}

export async function getUpcomingSwapDays(householdId: string): Promise<UpcomingSwapDay[]> {
  // Get active + upcoming weeks with contributions filtered to this household
  const activeWeeks = await db.query.weeks.findMany({
    where: inArray(weeks.status, ['active', 'upcoming']),
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
    status: string;
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
        weekStatus: week.status,
        assignedRecipe: myContribution?.recipe ?? null,
      });
    }
  }

  return result;
}

export async function getHeadcount(): Promise<number> {
  const [[userResult], [epResult]] = await Promise.all([
    db.select({ total: sum(user.portionsPerMeal) }).from(user)
      .where(isNotNull(user.householdId)),
    db.select({ total: sum(extraPeople.portions) }).from(extraPeople),
  ]);
  return (Number(userResult?.total) || 0) + (Number(epResult?.total) || 0);
}
