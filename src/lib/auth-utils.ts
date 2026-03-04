'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { households, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { VIEW_AS_COOKIE } from '@/lib/constants';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthenticatedSession = NonNullable<Session>;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type EffectiveSessionResult = {
  session: Session;
  viewAsName: string | null;
};

/**
 * Returns the effective session, handling admin impersonation via the
 * `meals-view-as` cookie. When an admin is viewing-as another user, the
 * returned session has the target user's identity (id, name, email, role,
 * householdId). The layout uses this to render the app as that user.
 */
export const getEffectiveSession = cache(async (): Promise<EffectiveSessionResult> => {
  const realSession = await auth.api.getSession({ headers: await headers() });
  if (!realSession) {
    return { session: null, viewAsName: null };
  }

  if (realSession.user.role !== 'admin') {
    return { session: realSession, viewAsName: null };
  }

  const cookieStore = await cookies();
  const viewAsUserId = cookieStore.get(VIEW_AS_COOKIE)?.value;
  if (!viewAsUserId) {
    return { session: realSession, viewAsName: null };
  }

  const [targetUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      householdId: user.householdId,
    })
    .from(user)
    .where(eq(user.id, viewAsUserId))
    .limit(1);

  if (!targetUser) {
    // Target user deleted — clear stale cookie and fall back
    cookieStore.delete(VIEW_AS_COOKIE);
    return { session: realSession, viewAsName: null };
  }

  return {
    session: {
      ...realSession,
      user: {
        ...realSession.user,
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role ?? 'member',
        householdId: targetUser.householdId,
      },
    },
    viewAsName: targetUser.name,
  };
});

export async function getSession(): Promise<Session> {
  const { session } = await getEffectiveSession();
  return session;
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
