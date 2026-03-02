import { db } from '@/lib/db';
import { notifications, user } from '@/lib/db/schema';
import { and, eq, ne } from 'drizzle-orm';

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
