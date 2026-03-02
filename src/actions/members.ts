'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { requireAdmin, requireHouseholdHead } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function assignMemberToHousehold(userId: string, householdId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Verify user exists
  const [target] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) {
    return { success: false as const, error: 'User not found' };
  }

  await db
    .update(user)
    .set({ householdId, updatedAt: new Date() })
    .where(eq(user.id, userId));

  revalidatePath('/household');
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath('/admin/households');
  return { success: true as const, data: null };
}

export async function getUnassignedUsers() {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  const { isNull } = await import('drizzle-orm');
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(isNull(user.householdId));
}

export async function getAllUsers() {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  return db
    .select({ id: user.id, name: user.name, email: user.email, householdId: user.householdId })
    .from(user);
}

export async function removeMember(userId: string, householdId: string) {
  // Must be admin or head of this household
  const auth = await requireHouseholdHead(householdId);
  if (!auth.success) return auth;

  // Don't allow removing yourself if you're the head
  if (userId === auth.data.user.id) {
    return { success: false as const, error: 'Cannot remove yourself' };
  }

  await db
    .update(user)
    .set({ householdId: null, updatedAt: new Date() })
    .where(eq(user.id, userId));

  revalidatePath('/household');
  revalidatePath(`/admin/households/${householdId}`);
  return { success: true as const, data: null };
}
