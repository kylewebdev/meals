import { db } from '@/lib/db';
import { notifications, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function notifyContributionReminder(weekId: string, householdId: string) {
  const members = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.householdId, householdId));

  for (const member of members) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'contribution_reminder',
      title: 'Time to post your contribution!',
      body: 'Your household hasn\'t posted a dish for this week\'s swap yet.',
      linkUrl: `/week/${weekId}`,
    });
  }
}

export async function notifyContributionPosted(weekId: string, contributorHouseholdId: string) {
  const members = await db
    .select({ id: user.id, householdId: user.householdId })
    .from(user);

  const otherMembers = members.filter((m) => m.householdId !== contributorHouseholdId);

  for (const member of otherMembers) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'contribution_posted',
      title: 'New contribution posted!',
      body: 'A household has posted their dish for this week\'s swap.',
      linkUrl: `/week/${weekId}`,
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
