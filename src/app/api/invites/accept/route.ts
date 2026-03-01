import { db } from '@/lib/db';
import { invites, user, account } from '@/lib/db/schema';
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

  // Hash the password using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Create user and account in a transaction-like flow
  const userId = crypto.randomUUID();
  const now = new Date();

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    householdId: invite.householdId,
    role: invite.role,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  // Mark invite as used
  await db.update(invites).set({ usedAt: now }).where(eq(invites.id, invite.id));

  return NextResponse.json({ success: true });
}
