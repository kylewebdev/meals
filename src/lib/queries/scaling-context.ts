import { db } from '@/lib/db';
import { contributions, swapDays, weeks } from '@/lib/db/schema';
import { getPortionCount } from '@/lib/schedule-utils';
import { getHeadcount } from './contributions';
import { and, eq } from 'drizzle-orm';

export interface ScalingContext {
  portionCount: number;
  headcount: number;
  swapDayLabel: string;
  weekStartDate: Date;
  weekId: string;
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

  const headcount = await getHeadcount(weekId);
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
  };
}
