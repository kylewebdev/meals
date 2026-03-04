import crypto from 'crypto';
import { notifySwapDayReminder } from '@/lib/notifications';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || !cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expected = `Bearer ${cronSecret}`;
  if (authHeader.length !== expected.length) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(authHeader),
    Buffer.from(expected),
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sent = await notifySwapDayReminder();
  return NextResponse.json({ ok: true, sent });
}
