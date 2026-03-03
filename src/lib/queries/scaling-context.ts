import { db } from '@/lib/db';
import { contributions, extraPeople, households, user } from '@/lib/db/schema';
import { getPortionCount } from '@/lib/schedule-utils';
import { getHeadcount } from './contributions';
import { and, count, eq, gt, isNotNull, sum } from 'drizzle-orm';

export interface HouseholdPortion {
  householdId: string;
  householdName: string;
  memberCount: number;
  portions: number;
  /** Extra portions beyond 1-per-member (from user portionsPerMeal > 1 + extra people) */
  extraPortions: number;
}

export interface ScalingContext {
  contributionId: string;
  /** Portions this household needs to cook (total ÷ households) */
  portionCount: number;
  /** Total portions needed across all households */
  totalPortions: number;
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
  // Subquery for extra_people portions per household
  const epSub = db
    .select({
      householdId: extraPeople.householdId,
      total: sum(extraPeople.portions).as('ep_total'),
    })
    .from(extraPeople)
    .groupBy(extraPeople.householdId)
    .as('ep');

  const rows = await db
    .select({
      householdId: households.id,
      householdName: households.name,
      epPortions: epSub.total,
      memberCount: count(user.id),
      portionCount: sum(user.portionsPerMeal),
    })
    .from(user)
    .innerJoin(households, eq(user.householdId, households.id))
    .leftJoin(epSub, eq(households.id, epSub.householdId))
    .where(and(isNotNull(user.householdId), gt(user.portionsPerMeal, 0)))
    .groupBy(households.id, households.name, epSub.total)
    .orderBy(households.name);

  return rows.map((r) => {
    const portionSum = Number(r.portionCount) || 0;
    const epPortions = Number(r.epPortions) || 0;
    const extra = (portionSum - r.memberCount) + epPortions;
    return {
      householdId: r.householdId,
      householdName: r.householdName,
      memberCount: r.memberCount,
      portions: getPortionCount(portionSum + epPortions, coversFrom, coversTo),
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
    id: string;
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

  const totalPortions = getPortionCount(
    headcount,
    contribution.swapDay.coversFrom,
    contribution.swapDay.coversTo,
  );

  const householdCount = householdPortions.length || 1;
  const portionCount = Math.ceil(totalPortions / householdCount);

  return {
    contributionId: contribution.id,
    portionCount,
    totalPortions,
    headcount,
    swapDayLabel: contribution.swapDay.label,
    weekStartDate: contribution.week.startDate,
    weekId,
    householdPortions,
  };
}
