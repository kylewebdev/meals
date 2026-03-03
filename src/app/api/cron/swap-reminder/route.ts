import { notifySwapDayReminder } from '@/lib/notifications';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sent = await notifySwapDayReminder();
  return NextResponse.json({ ok: true, sent });
}
