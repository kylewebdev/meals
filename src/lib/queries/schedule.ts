import { db } from '@/lib/db';
import { households, weeks } from '@/lib/db/schema';
import { asc, eq, gte, lte, and } from 'drizzle-orm';

interface ScheduleWeek {
  id: string;
  startDate: Date;
  status: string;
  householdId: string;
  pickupLocation: string | null;
  pickupTimes: string | null;
  pickupNotes: string | null;
  household: { id: string; name: string };
}

export async function getSchedule(startDate?: Date, endDate?: Date): Promise<ScheduleWeek[]> {
  const conditions = [];
  if (startDate) conditions.push(gte(weeks.startDate, startDate));
  if (endDate) conditions.push(lte(weeks.startDate, endDate));

  return db.query.weeks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      household: { columns: { id: true, name: true } },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as Promise<ScheduleWeek[]>;
}

export interface CurrentWeek extends ScheduleWeek {
  mealPlanEntries: {
    id: string;
    weekId: string;
    dayOfWeek: number;
    mealType: string;
    name: string | null;
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
  }[];
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

  return db.query.weeks.findFirst({
    where: and(gte(weeks.startDate, monday), lte(weeks.startDate, sunday)),
    with: {
      household: { columns: { id: true, name: true } },
      mealPlanEntries: {
        with: {
          recipe: {
            columns: { id: true, name: true, calories: true, proteinG: true, carbsG: true, fatG: true },
          },
        },
      },
    },
  }) as unknown as Promise<CurrentWeek | undefined>;
}

export interface AdminWeek {
  id: string;
  startDate: Date;
  status: string;
  householdId: string;
  household: { id: string; name: string };
  _count: { mealPlanEntries: number };
}

export async function getAllWeeks(): Promise<AdminWeek[]> {
  const rawWeeks = await db.query.weeks.findMany({
    with: {
      household: { columns: { id: true, name: true } },
      mealPlanEntries: { columns: { id: true } },
    },
    orderBy: (w, { asc }) => [asc(w.startDate)],
  }) as unknown as (Omit<AdminWeek, '_count'> & { mealPlanEntries: { id: string }[] })[];

  return rawWeeks.map((w) => ({
    id: w.id,
    startDate: w.startDate,
    status: w.status,
    householdId: w.householdId,
    household: w.household,
    _count: { mealPlanEntries: w.mealPlanEntries.length },
  }));
}

export interface RotationHousehold {
  id: string;
  name: string;
  rotationPosition: number;
  members: { id: string }[];
}

export async function getRotationOrder(): Promise<RotationHousehold[]> {
  return db.query.households.findMany({
    columns: { id: true, name: true, rotationPosition: true },
    with: { members: { columns: { id: true } } },
    orderBy: (h, { asc }) => [asc(h.rotationPosition)],
  }) as unknown as Promise<RotationHousehold[]>;
}
