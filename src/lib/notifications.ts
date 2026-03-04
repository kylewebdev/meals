import { db } from '@/lib/db';
import { contributions, notifications, recipes, swapDays, user, weeks } from '@/lib/db/schema';
import { getSwapDate, getThisMonday } from '@/lib/schedule-utils';
import { and, eq, gte, inArray, ne } from 'drizzle-orm';

export async function notifyMemberJoined(
  householdId: string,
  newMemberName: string,
  newMemberId: string,
) {
  const members = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.householdId, householdId), ne(user.id, newMemberId)));

  if (members.length === 0) return;

  await db.insert(notifications).values(
    members.map((member) => ({
      userId: member.id,
      type: 'member_joined' as const,
      title: 'New household member!',
      body: `${newMemberName} has joined your household.`,
      linkUrl: '/co-op',
    })),
  );
}

export async function notifyNewRecipe(recipeId: string, recipeName: string) {
  const members = await db
    .select({ id: user.id })
    .from(user);

  if (members.length === 0) return;

  await db.insert(notifications).values(
    members.map((member) => ({
      userId: member.id,
      type: 'new_recipe' as const,
      title: 'New recipe added!',
      body: `"${recipeName}" has been added to the recipe catalog.`,
      linkUrl: `/recipes/${recipeId}`,
    })),
  );
}

export async function notifyRecipeReviewed(
  recipeId: string,
  recipeName: string,
  creatorId: string,
  approved: boolean,
  feedback?: string,
) {
  const title = approved
    ? 'Your recipe was approved!'
    : 'Your recipe was sent back for changes';
  const body = approved
    ? `"${recipeName}" has been approved and is now in the recipe catalog.`
    : `"${recipeName}" was sent back for changes.${feedback ? ` Feedback: ${feedback}` : ''}`;

  await db.insert(notifications).values({
    userId: creatorId,
    type: 'recipe_reviewed',
    title,
    body,
    linkUrl: `/recipes/${recipeId}`,
  });
}

export async function notifyRecipeComment(
  recipeId: string,
  recipeName: string,
  creatorId: string,
  commenterId: string,
  commenterName: string,
  priorCommenterIds: string[],
) {
  const recipientIds = new Set<string>();
  if (creatorId !== commenterId) recipientIds.add(creatorId);
  for (const id of priorCommenterIds) recipientIds.add(id);

  const rows = [...recipientIds].map((userId) => ({
    userId,
    type: 'recipe_commented' as const,
    title: 'New comment on recipe',
    body: `${commenterName} commented on "${recipeName}".`,
    linkUrl: `/recipes/${recipeId}`,
  }));

  if (rows.length > 0) {
    await db.insert(notifications).values(rows);
  }
}

/**
 * Send swap day reminders to every household member the day before a swap.
 * Each notification includes the meal their household is assigned to make.
 */
export async function notifySwapDayReminder() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const monday = getThisMonday();
  // Fetch current + future weeks with their swap days + contributions in one query
  const activeWeeks = await db.query.weeks.findMany({
    where: gte(weeks.startDate, monday),
    with: {
      swapDays: {
        with: {
          contributions: {
            columns: { householdId: true, dishName: true },
            with: {
              recipe: { columns: { name: true } },
            },
          },
        },
      },
    },
  }) as {
    id: string;
    startDate: Date;
    swapDays: {
      id: string;
      dayOfWeek: number;
      contributions: {
        householdId: string;
        dishName: string | null;
        recipe: { name: string } | null;
      }[];
    }[];
  }[];

  // Collect all notification rows to insert
  const pendingNotifications: {
    householdId: string;
    mealName: string;
  }[] = [];

  for (const week of activeWeeks) {
    for (const sd of week.swapDays) {
      const swapDate = getSwapDate(week.startDate, sd.dayOfWeek);
      swapDate.setHours(0, 0, 0, 0);

      if (swapDate.getTime() !== tomorrow.getTime()) continue;

      for (const contrib of sd.contributions) {
        pendingNotifications.push({
          householdId: contrib.householdId,
          mealName: contrib.recipe?.name ?? contrib.dishName ?? 'your assigned meal',
        });
      }
    }
  }

  if (pendingNotifications.length === 0) return 0;

  // Batch-fetch all members for the relevant households
  const householdIds = [...new Set(pendingNotifications.map((p) => p.householdId))];
  const allMembers = await db
    .select({ id: user.id, householdId: user.householdId })
    .from(user)
    .where(inArray(user.householdId, householdIds));

  const membersByHousehold = new Map<string, string[]>();
  for (const m of allMembers) {
    if (!m.householdId) continue;
    const list = membersByHousehold.get(m.householdId) ?? [];
    list.push(m.id);
    membersByHousehold.set(m.householdId, list);
  }

  // Build all notification rows and batch-insert
  const rows: {
    userId: string;
    type: 'swap_reminder';
    title: string;
    body: string;
    linkUrl: string;
  }[] = [];

  for (const { householdId, mealName } of pendingNotifications) {
    const memberIds = membersByHousehold.get(householdId) ?? [];
    for (const memberId of memberIds) {
      rows.push({
        userId: memberId,
        type: 'swap_reminder',
        title: 'Swap day tomorrow!',
        body: `Reminder: Your household is making "${mealName}" for tomorrow's swap.`,
        linkUrl: '/up-next',
      });
    }
  }

  if (rows.length > 0) {
    await db.insert(notifications).values(rows);
  }

  return rows.length;
}
