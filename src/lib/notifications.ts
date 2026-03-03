import { db } from '@/lib/db';
import { contributions, notifications, recipes, swapDays, user, weeks } from '@/lib/db/schema';
import { getSwapDate } from '@/lib/schedule-utils';
import { and, eq, inArray, ne } from 'drizzle-orm';

export async function notifyMemberJoined(
  householdId: string,
  newMemberName: string,
  newMemberId: string,
) {
  const members = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.householdId, householdId), ne(user.id, newMemberId)));

  for (const member of members) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'member_joined',
      title: 'New household member!',
      body: `${newMemberName} has joined your household.`,
      linkUrl: '/household',
    });
  }
}

export async function notifyNewRecipe(recipeId: string, recipeName: string) {
  const members = await db
    .select({ id: user.id })
    .from(user);

  for (const member of members) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'new_recipe',
      title: 'New recipe added!',
      body: `"${recipeName}" has been added to the recipe catalog.`,
      linkUrl: `/recipes/${recipeId}`,
    });
  }
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
    : 'Your recipe needs changes';
  const body = approved
    ? `"${recipeName}" has been approved and is now in the recipe catalog.`
    : `"${recipeName}" was not approved.${feedback ? ` Feedback: ${feedback}` : ''}`;

  await db.insert(notifications).values({
    userId: creatorId,
    type: 'recipe_reviewed',
    title,
    body,
    linkUrl: `/recipes/${recipeId}`,
  });
}

/**
 * Send swap day reminders to every household member the day before a swap.
 * Each notification includes the meal their household is assigned to make.
 */
export async function notifySwapDayReminder() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const activeWeeks = await db
    .select()
    .from(weeks)
    .where(inArray(weeks.status, ['upcoming', 'active']));

  let sent = 0;

  for (const week of activeWeeks) {
    const dayRows = await db
      .select()
      .from(swapDays)
      .where(eq(swapDays.weekId, week.id));

    for (const sd of dayRows) {
      const swapDate = getSwapDate(week.startDate, sd.dayOfWeek);
      swapDate.setHours(0, 0, 0, 0);

      if (swapDate.getTime() !== tomorrow.getTime()) continue;

      // Get contributions with their recipe names
      const contribs = await db
        .select({
          householdId: contributions.householdId,
          recipeName: recipes.name,
          dishName: contributions.dishName,
        })
        .from(contributions)
        .leftJoin(recipes, eq(contributions.recipeId, recipes.id))
        .where(eq(contributions.swapDayId, sd.id));

      for (const contrib of contribs) {
        const mealName = contrib.recipeName ?? contrib.dishName ?? 'your assigned meal';

        const members = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.householdId, contrib.householdId));

        for (const member of members) {
          await db.insert(notifications).values({
            userId: member.id,
            type: 'swap_reminder',
            title: 'Swap day tomorrow!',
            body: `Reminder: Your household is making "${mealName}" for tomorrow's swap.`,
            linkUrl: '/schedule',
          });
        }
        sent += members.length;
      }
    }
  }

  return sent;
}
