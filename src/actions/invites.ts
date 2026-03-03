'use server';

import { db } from '@/lib/db';
import type { UserRole } from '@/lib/db/schema';
import { invites } from '@/lib/db/schema';
import { requireAdmin, requireHouseholdHead } from '@/lib/auth-utils';
import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createInvite(data: {
  email: string;
  householdId?: string;
  role?: UserRole;
}) {
  const isSpectator = data.role === 'spectator';

  // Validate inputs before auth checks
  const email = data.email.trim().toLowerCase();
  if (!email) return { success: false as const, error: 'Email is required' };
  if (!isSpectator && !data.householdId) {
    return { success: false as const, error: 'Household is required for non-spectator invites' };
  }

  // Spectator invites require admin; household invites require household head
  const auth = isSpectator
    ? await requireAdmin()
    : await requireHouseholdHead(data.householdId!);
  if (!auth.success) return auth;

  // Invalidate existing unused invites for this email, scoped to same context
  const deleteConditions = [eq(invites.email, email), isNull(invites.usedAt)];
  if (data.householdId) {
    deleteConditions.push(eq(invites.householdId, data.householdId));
  } else {
    deleteConditions.push(isNull(invites.householdId));
  }
  await db.delete(invites).where(and(...deleteConditions));

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(invites).values({
    email,
    householdId: data.householdId ?? null,
    role: data.role ?? 'member',
    token,
    invitedBy: auth.data.user.id,
    expiresAt,
  });

  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/register?token=${token}`;

  if (data.householdId) {
    revalidatePath(`/admin/households/${data.householdId}`);
  }
  revalidatePath('/co-op');
  revalidatePath('/admin/users');
  return { success: true as const, data: { inviteUrl, token, expiresAt } };
}

export async function removeInvite(inviteId: string, householdId: string) {
  const auth = await requireHouseholdHead(householdId);
  if (!auth.success) return auth;

  await db
    .delete(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.householdId, householdId)));

  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath('/co-op');
  return { success: true as const, data: null };
}
