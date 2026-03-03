'use server';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';

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

export async function archiveNotification(id: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(notifications)
    .set({ archivedAt: new Date(), readAt: new Date() })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, auth.data.user.id),
      ),
    );

  return { success: true as const, data: null };
}

export async function archiveAllRead() {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(notifications)
    .set({ archivedAt: new Date() })
    .where(
      and(
        eq(notifications.userId, auth.data.user.id),
        isNotNull(notifications.readAt),
        isNull(notifications.archivedAt),
      ),
    );

  return { success: true as const, data: null };
}

export async function unarchiveNotification(id: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(notifications)
    .set({ archivedAt: null })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, auth.data.user.id),
      ),
    );

  return { success: true as const, data: null };
}
