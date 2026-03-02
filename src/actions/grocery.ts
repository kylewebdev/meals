'use server';

import { db } from '@/lib/db';
import { groceryItems } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { resyncGroceryList as resyncQuery } from '@/lib/queries/grocery';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleGroceryItem(itemId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const item = await db.query.groceryItems.findFirst({
    where: eq(groceryItems.id, itemId),
  });

  if (!item) {
    return { success: false as const, error: 'Item not found' };
  }

  await db.update(groceryItems)
    .set({ checked: !item.checked })
    .where(eq(groceryItems.id, itemId));

  return { success: true as const, data: null };
}

export async function resyncGroceryList(listId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  const list = await resyncQuery(listId);

  if (!list) {
    return { success: false as const, error: 'Grocery list not found' };
  }

  return { success: true as const, data: null };
}
