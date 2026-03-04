'use server';

import { db } from '@/lib/db';
import type { UserRole } from '@/lib/db/schema';
import { account, households, invites, user, userRoleEnum } from '@/lib/db/schema';
import { requireAdmin, requireHouseholdHead } from '@/lib/auth-utils';
import { isValidMeals } from '@/lib/validators';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hashPassword } from 'better-auth/crypto';
import { notifyMemberJoined } from '@/lib/notifications';

export async function assignMemberToHousehold(userId: string, householdId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  // Verify user exists
  const [target] = await db
    .select({ id: user.id, name: user.name })
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

  notifyMemberJoined(householdId, target.name, userId).catch(() => {});

  revalidatePath('/co-op');
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath('/admin/households');
  return { success: true as const, data: null };
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

  revalidatePath('/co-op');
  revalidatePath(`/admin/households/${householdId}`);
  return { success: true as const, data: null };
}

export async function getAllUsersWithDetails() {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      householdId: user.householdId,
      householdName: households.name,
      meals: user.meals,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(households, eq(user.householdId, households.id))
    .orderBy(user.name);

  return rows;
}

export async function adminUpdateMeals(userId: string, meals: number) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (!isValidMeals(meals)) {
    return { success: false as const, error: 'Meals must be between 0 and 3' };
  }

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
    .set({ meals: meals, updatedAt: new Date() })
    .where(eq(user.id, userId));

  revalidatePath('/', 'layout');
  return { success: true as const, data: null };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (userId === auth.data.user.id) {
    return { success: false as const, error: 'Cannot change your own role' };
  }

  if (!userRoleEnum.enumValues.includes(role)) {
    return { success: false as const, error: 'Invalid role' };
  }

  const [target] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) {
    return { success: false as const, error: 'User not found' };
  }

  const updates: { role: typeof role; householdId?: null; updatedAt: Date } = {
    role,
    updatedAt: new Date(),
  };

  // Spectators don't belong to a household
  if (role === 'spectator') {
    updates.householdId = null;
  }

  await db.update(user).set(updates).where(eq(user.id, userId));

  revalidatePath('/admin/users');
  revalidatePath('/co-op');
  return { success: true as const, data: null };
}

function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export async function adminResetPassword(userId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const [target] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) {
    return { success: false as const, error: 'User not found' };
  }

  const tempPassword = generateTempPassword();
  const hashed = await hashPassword(tempPassword);

  await db
    .update(account)
    .set({ password: hashed, updatedAt: new Date() })
    .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')));

  return { success: true as const, data: { tempPassword } };
}

export async function deleteUser(userId: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (userId === auth.data.user.id) {
    return { success: false as const, error: 'Cannot delete yourself' };
  }

  const [target] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) {
    return { success: false as const, error: 'User not found' };
  }

  // Check if user is a household head — must unset first
  const [headOf] = await db
    .select({ id: households.id, name: households.name })
    .from(households)
    .where(eq(households.headId, userId))
    .limit(1);

  if (headOf) {
    return {
      success: false as const,
      error: `User is head of "${headOf.name}". Reassign the head first.`,
    };
  }

  // Nullify invitedBy references (no cascade on this FK)
  await db
    .update(invites)
    .set({ invitedBy: null })
    .where(eq(invites.invitedBy, userId));

  // Transfer recipes to the admin performing the deletion
  const { recipes } = await import('@/lib/db/schema');
  await db
    .update(recipes)
    .set({ createdBy: auth.data.user.id, updatedAt: new Date() })
    .where(eq(recipes.createdBy, userId));

  // Delete user (sessions, accounts, notifications cascade automatically)
  await db.delete(user).where(eq(user.id, userId));

  revalidatePath('/admin/users');
  revalidatePath('/admin/households');
  return { success: true as const, data: null };
}
