import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { invites, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notifyMemberJoined } from '@/lib/notifications';
import { validatePassword } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter keyed by IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await request.json();
  const { token, name, email, password } = body;

  if (!token || !name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return NextResponse.json(
      { error: `Password requirements not met: ${errors.join(', ')}` },
      { status: 400 },
    );
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

  // Assign household (if present) and role from the invite
  await db
    .update(user)
    .set({
      ...(invite.householdId ? { householdId: invite.householdId } : {}),
      role: invite.role,
    })
    .where(eq(user.id, ctx.user.id));

  // Mark invite as used
  await db.update(invites).set({ usedAt: new Date() }).where(eq(invites.id, invite.id));

  if (invite.householdId) {
    notifyMemberJoined(invite.householdId, name, ctx.user.id).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
