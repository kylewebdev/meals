'use server';

import { db } from '@/lib/db';
import { groceryItems, groceryLists, contributions } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { resyncGroceryList as resyncQuery } from '@/lib/queries/grocery';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleGroceryItem(itemId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';

  // Fetch item and join through groceryLists → contributions to get householdId
  const [row] = await db
    .select({
      id: groceryItems.id,
      checked: groceryItems.checked,
      householdId: contributions.householdId,
    })
    .from(groceryItems)
    .innerJoin(groceryLists, eq(groceryItems.listId, groceryLists.id))
    .innerJoin(contributions, eq(groceryLists.contributionId, contributions.id))
    .where(eq(groceryItems.id, itemId))
    .limit(1);

  if (!row) {
    return { success: false as const, error: 'Item not found' };
  }

  if (!isAdmin && row.householdId !== auth.data.user.householdId) {
    return { success: false as const, error: 'Not authorized to modify this item' };
  }

  await db.update(groceryItems)
    .set({ checked: !row.checked })
    .where(eq(groceryItems.id, itemId));

  return { success: true as const, data: null };
}

export async function resyncGroceryList(listId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const isAdmin = auth.data.user.role === 'admin';

  // Verify household ownership before resyncing
  const [row] = await db
    .select({ householdId: contributions.householdId })
    .from(groceryLists)
    .innerJoin(contributions, eq(groceryLists.contributionId, contributions.id))
    .where(eq(groceryLists.id, listId))
    .limit(1);

  if (!row) {
    return { success: false as const, error: 'Grocery list not found' };
  }

  if (!isAdmin && row.householdId !== auth.data.user.householdId) {
    return { success: false as const, error: 'Not authorized to resync this list' };
  }

  const list = await resyncQuery(listId);

  if (!list) {
    return { success: false as const, error: 'Grocery list not found' };
  }

  return { success: true as const, data: null };
}
