'use server';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { and, eq, isNull } from 'drizzle-orm';

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
