import { db } from '@/lib/db';
import { contributions, households, user } from '@/lib/db/schema';
import { getPortionCount } from '@/lib/schedule-utils';
import { getHeadcount } from './contributions';
import { and, count, eq, isNotNull, sum } from 'drizzle-orm';

export interface HouseholdPortion {
  householdId: string;
  householdName: string;
  memberCount: number;
  portions: number;
  /** Extra portions beyond 1-per-member (from user portionsPerMeal > 1 + household extraPortions) */
  extraPortions: number;
}

export interface ScalingContext {
  portionCount: number;
  headcount: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
  householdPortions: HouseholdPortion[];
}

async function getHouseholdPortions(
  coversFrom: number,
  coversTo: number,
): Promise<HouseholdPortion[]> {
  const rows = await db
    .select({
      householdId: households.id,
      householdName: households.name,
      extraPortions: households.extraPortions,
      memberCount: count(user.id),
      portionCount: sum(user.portionsPerMeal),
    })
    .from(user)
    .innerJoin(households, eq(user.householdId, households.id))
    .where(isNotNull(user.householdId))
    .groupBy(households.id, households.name, households.extraPortions)
    .orderBy(households.name);

  return rows.map((r) => {
    const portionSum = Number(r.portionCount) || 0;
    const extra = (portionSum - r.memberCount) + r.extraPortions;
    return {
      householdId: r.householdId,
      householdName: r.householdName,
      memberCount: r.memberCount,
      portions: getPortionCount(portionSum + r.extraPortions, coversFrom, coversTo),
      extraPortions: extra,
    };
  });
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
    swapDay: { label: string; coversFrom: number; coversTo: number };
    week: { startDate: Date };
  } | undefined;

  if (!contribution) return null;

  const [headcount, householdPortions] = await Promise.all([
    getHeadcount(),
    getHouseholdPortions(
      contribution.swapDay.coversFrom,
      contribution.swapDay.coversTo,
    ),
  ]);

  const portionCount = getPortionCount(
    headcount,
    contribution.swapDay.coversFrom,
    contribution.swapDay.coversTo,
  );

  return {
    portionCount,
    headcount,
    swapDayLabel: contribution.swapDay.label,
    weekStartDate: contribution.week.startDate,
    weekId,
    householdPortions,
  };
}
