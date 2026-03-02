'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { households, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthenticatedSession = NonNullable<Session>;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSession(): Promise<Session> {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(): Promise<
  ActionResult<AuthenticatedSession>
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }
  return { success: true, data: session };
}

export async function requireAdmin(): Promise<
  ActionResult<AuthenticatedSession>
> {
  const result = await requireSession();
  if (!result.success) return result;
  if (result.data.user.role !== 'admin') {
    return { success: false, error: 'Admin access required' };
  }
  return result;
}

export async function requireHouseholdHead(
  householdId: string,
): Promise<ActionResult<AuthenticatedSession>> {
  const result = await requireSession();
  if (!result.success) return result;

  // Admins can always act
  if (result.data.user.role === 'admin') return result;

  const [household] = await db
    .select({ headId: households.headId })
    .from(households)
    .where(eq(households.id, householdId))
    .limit(1);

  if (!household || household.headId !== result.data.user.id) {
    return { success: false, error: 'Must be household head or admin' };
  }
  return result;
}

export async function isHouseholdMember(
  householdId: string,
  userId: string,
): Promise<boolean> {
  const [member] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(eq(user.id, userId), eq(user.householdId, householdId)),
    )
    .limit(1);

  return !!member;
}
