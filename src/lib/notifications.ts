import { db } from '@/lib/db';
import { notifications, user, weeks } from '@/lib/db/schema';
import { eq, ne } from 'drizzle-orm';

export async function notifyCookingReminder(weekId: string) {
  const [week] = await db.query.weeks.findMany({
    where: eq(weeks.id, weekId),
    with: { household: { columns: { id: true, name: true } } },
    limit: 1,
  });
  if (!week) return;

  const members = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.householdId, week.household.id));

  for (const member of members) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'cooking_reminder',
      title: 'Your household is cooking this week!',
      body: `${week.household.name} is assigned to cook. Time to plan your meals.`,
      linkUrl: `/week/${weekId}`,
    });
  }
}

export async function notifyMealPlanPosted(weekId: string, cookingHouseholdId: string) {
  const members = await db
    .select({ id: user.id, householdId: user.householdId })
    .from(user);

  const otherMembers = members.filter((m) => m.householdId !== cookingHouseholdId);

  for (const member of otherMembers) {
    await db.insert(notifications).values({
      userId: member.id,
      type: 'meal_plan_posted',
      title: 'Meal plan posted!',
      body: 'The meal plan for this week has been updated. Check it out!',
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
