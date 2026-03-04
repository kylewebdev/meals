import { db } from '@/lib/db';
import { contributions, extraPeople, households, user } from '@/lib/db/schema';
import { getMealCount } from '@/lib/schedule-utils';
import { and, count, eq, gt, isNotNull, sum } from 'drizzle-orm';

export interface HouseholdMeals {
  householdId: string;
  householdName: string;
  memberCount: number;
  meals: number;
  /** Extra meals beyond 1-per-member (from user meals > 1 + extra people) */
  extraMeals: number;
}

export interface ScalingContext {
  contributionId: string;
  /** Meals this household needs to cook (total ÷ households) */
  mealCount: number;
  /** Total meals needed across all households */
  totalMeals: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
  householdMeals: HouseholdMeals[];
}

export interface BaseHouseholdData {
  householdId: string;
  householdName: string;
  memberCount: number;
  /** Per-day headcount (meals sum + extra people) */
  baseMeals: number;
  extraMeals: number;
}

/** Fetch per-household headcount data (DB call, independent of day coverage). */
export async function getBaseHouseholdData(): Promise<BaseHouseholdData[]> {
  // Subquery for extra_people meals per household
  const epSub = db
    .select({
      householdId: extraPeople.householdId,
      total: sum(extraPeople.meals).as('ep_total'),
    })
    .from(extraPeople)
    .groupBy(extraPeople.householdId)
    .as('ep');

  const rows = await db
    .select({
      householdId: households.id,
      householdName: households.name,
      epMeals: epSub.total,
      memberCount: count(user.id),
      mealCount: sum(user.meals),
    })
    .from(user)
    .innerJoin(households, eq(user.householdId, households.id))
    .leftJoin(epSub, eq(households.id, epSub.householdId))
    .where(and(isNotNull(user.householdId), gt(user.meals, 0)))
    .groupBy(households.id, households.name, epSub.total)
    .orderBy(households.name);

  return rows.map((r) => {
    const mealSum = Number(r.mealCount) || 0;
    const epMeals = Number(r.epMeals) || 0;
    return {
      householdId: r.householdId,
      householdName: r.householdName,
      memberCount: r.memberCount,
      baseMeals: mealSum + epMeals,
      extraMeals: (mealSum - r.memberCount) + epMeals,
    };
  });
}

/** Pure: apply day-coverage multiplier to base household data. */
export function applyDayCoverage(
  base: BaseHouseholdData[],
  coversFrom: number,
  coversTo: number,
): HouseholdMeals[] {
  return base.map((b) => ({
    householdId: b.householdId,
    householdName: b.householdName,
    memberCount: b.memberCount,
    meals: getMealCount(b.baseMeals, coversFrom, coversTo),
    extraMeals: b.extraMeals,
  }));
}

/** Convenience: single DB call + day-coverage in one step. */
export async function getHouseholdMeals(
  coversFrom: number,
  coversTo: number,
): Promise<HouseholdMeals[]> {
  const base = await getBaseHouseholdData();
  return applyDayCoverage(base, coversFrom, coversTo);
}

export async function getScalingContext(
  weekId: string,
  recipeId: string,
): Promise<ScalingContext | null> {
  // Find a contribution linking this recipe to this week
  const contribution = await db.query.contributions.findFirst({
    where: and(
      eq(contributions.weekId, weekId),
      eq(contributions.recipeId, recipeId),
    ),
    with: {
      swapDay: {
        columns: { label: true, coversFrom: true, coversTo: true },
      },
      week: {
        columns: { startDate: true },
      },
    },
  }) as unknown as {
    id: string;
    swapDay: { label: string; coversFrom: number; coversTo: number };
    week: { startDate: Date };
  } | undefined;

  if (!contribution) return null;

  const householdMeals = await getHouseholdMeals(
    contribution.swapDay.coversFrom,
    contribution.swapDay.coversTo,
  );

  const totalMeals = householdMeals.reduce((sum, hp) => sum + hp.meals, 0);

  const householdCount = householdMeals.length || 1;
  const mealCount = Math.ceil(totalMeals / householdCount);

  return {
    contributionId: contribution.id,
    mealCount,
    totalMeals,
    swapDayLabel: contribution.swapDay.label,
    weekStartDate: contribution.week.startDate,
    weekId,
    householdMeals,
  };
}
