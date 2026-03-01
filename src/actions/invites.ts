'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { invites } from '@/lib/db/schema';
import { headers } from 'next/headers';

export async function createInvite(data: {
  email: string;
  householdId: string;
  role?: 'admin' | 'member';
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, error: 'Not authenticated' };
  }

  // Only admins can create invites
  if (session.user.role !== 'admin') {
    return { success: false as const, error: 'Only admins can create invites' };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(invites).values({
    email: data.email,
    householdId: data.householdId,
    role: data.role ?? 'member',
    token,
    expiresAt,
  });

  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/register?token=${token}`;

  return { success: true as const, data: { inviteUrl, token, expiresAt } };
}
