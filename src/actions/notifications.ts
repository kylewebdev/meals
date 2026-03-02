'use server';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getNotifications(limit = 20) {
  const auth = await requireSession();
  if (!auth.success) return [];

  return db.query.notifications.findMany({
    where: eq(notifications.userId, auth.data.user.id),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit,
  });
}

export async function getUnreadCount() {
  const auth = await requireSession();
  if (!auth.success) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, auth.data.user.id),
        isNull(notifications.readAt),
      ),
    );

  return result?.count ?? 0;
}

export async function markAsRead(id: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, auth.data.user.id),
      ),
    );

  return { success: true as const, data: null };
}

export async function markAllAsRead() {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, auth.data.user.id),
        isNull(notifications.readAt),
      ),
    );

  return { success: true as const, data: null };
}
