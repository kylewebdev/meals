'use server';

import { db } from '@/lib/db';
import { invites } from '@/lib/db/schema';
import { requireHouseholdHead, requireSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function createInvite(data: {
  email: string;
  householdId: string;
  role?: 'admin' | 'member';
}) {
  // Admin or head of this household can invite
  const auth = await requireHouseholdHead(data.householdId);
  if (!auth.success) return auth;

  const email = data.email.trim().toLowerCase();
  if (!email) return { success: false as const, error: 'Email is required' };

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(invites).values({
    email,
    householdId: data.householdId,
    role: data.role ?? 'member',
    token,
    invitedBy: auth.data.user.id,
    expiresAt,
  });

  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/register?token=${token}`;

  revalidatePath(`/admin/households/${data.householdId}`);
  revalidatePath('/household');
  return { success: true as const, data: { inviteUrl, token, expiresAt } };
}
