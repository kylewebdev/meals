import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { invites, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, name, email, password } = body;

  if (!token || !name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Find the invite
  const [invite] = await db.select().from(invites).where(eq(invites.token, token));

  if (!invite) {
    return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
  }

  if (invite.usedAt) {
    return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  }

  // Check if user already exists
  const [existingUser] = await db.select().from(user).where(eq(user.email, email));

  if (existingUser) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 400 },
    );
  }

  // Create user via Better Auth so password is hashed correctly
  const ctx = await auth.api.signUpEmail({
    body: { email, name, password },
  });

  if (!ctx.user) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }

  // Assign household and role from the invite
  await db
    .update(user)
    .set({ householdId: invite.householdId, role: invite.role })
    .where(eq(user.id, ctx.user.id));

  // Mark invite as used
  await db.update(invites).set({ usedAt: new Date() }).where(eq(invites.id, invite.id));

  return NextResponse.json({ success: true });
}
