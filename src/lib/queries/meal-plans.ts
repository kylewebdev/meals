import { db } from '@/lib/db';
import { mealPlanEntries, user, weeks } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export interface MealPlanEntry {
  id: string;
  weekId: string;
  dayOfWeek: number;
  mealType: string;
  name: string | null;
  description: string | null;
  recipeId: string | null;
  isModified: boolean;
  modificationNotes: string | null;
  modifiedCalories: number | null;
  modifiedProteinG: number | null;
  modifiedCarbsG: number | null;
  modifiedFatG: number | null;
  recipe: {
    id: string;
    name: string;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

export interface WeekWithPlan {
  id: string;
  startDate: Date;
  status: string;
  householdId: string;
  pickupLocation: string | null;
  pickupTimes: string | null;
  pickupNotes: string | null;
  household: { id: string; name: string; headId: string | null };
  mealPlanEntries: MealPlanEntry[];
}

export async function getWeekMealPlan(weekId: string): Promise<MealPlanEntry[]> {
  return db.query.mealPlanEntries.findMany({
    where: eq(mealPlanEntries.weekId, weekId),
    with: {
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
    orderBy: (e, { asc }) => [asc(e.dayOfWeek), asc(e.mealType)],
  }) as unknown as Promise<MealPlanEntry[]>;
}

export async function getWeekWithPlan(weekId: string): Promise<WeekWithPlan | undefined> {
  return db.query.weeks.findFirst({
    where: eq(weeks.id, weekId),
    with: {
      household: {
        columns: { id: true, name: true, headId: true },
      },
      mealPlanEntries: {
        with: {
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
        orderBy: (e, { asc }) => [asc(e.dayOfWeek), asc(e.mealType)],
      },
    },
  }) as unknown as Promise<WeekWithPlan | undefined>;
}

export async function getHeadcount(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(user);
  return result?.count ?? 0;
}
