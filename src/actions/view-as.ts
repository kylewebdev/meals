'use server';

import { auth as betterAuth } from '@/lib/auth';
import { cookies, headers } from 'next/headers';

export async function enableViewAs(userId: string) {
  // Check real session directly — requireAdmin() uses the effective (impersonated)
  // session, which would fail if already viewing-as another user.
  const session = await betterAuth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== 'admin') {
    return { success: false as const, error: 'Admin access required' };
  }

  const cookieStore = await cookies();
  cookieStore.set('meals-view-as', userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return { success: true as const, data: null };
}

export async function disableViewAs() {
  const cookieStore = await cookies();
  cookieStore.delete('meals-view-as');
  return { success: true as const, data: null };
}
