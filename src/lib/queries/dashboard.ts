import { db } from '@/lib/db';
import { households, recipes, user, weeks } from '@/lib/db/schema';
import { and, count, eq, gte, lte } from 'drizzle-orm';

export interface DashboardStats {
  recipeCount: number;
  householdMemberCount: number;
  householdCount: number;
  currentWeekStatus: string | null;
}

export async function getDashboardStats(householdId: string | null): Promise<DashboardStats> {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const [recipeResult, memberResult, householdResult, currentWeek] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(eq(recipes.status, 'approved')),
    householdId
      ? db.select({ count: count() }).from(user).where(eq(user.householdId, householdId))
      : Promise.resolve([{ count: 0 }]),
    db.select({ count: count() }).from(households),
    db.query.weeks.findFirst({
      where: and(gte(weeks.startDate, monday), lte(weeks.startDate, sunday)),
      columns: { status: true },
    }),
  ]);

  return {
    recipeCount: recipeResult[0]?.count ?? 0,
    householdMemberCount: memberResult[0]?.count ?? 0,
    householdCount: householdResult[0]?.count ?? 0,
    currentWeekStatus: currentWeek?.status ?? null,
  };
}
