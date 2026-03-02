import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications, weekOptOuts } from '@/lib/db/schema';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from '@/components/layout/providers';
import { OptOutBanner } from '@/components/layout/opt-out-banner';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { getUserCurrentWeekOptOut, getUnnotifiedResets } from '@/lib/queries/schedule';
import { and, eq, isNull, count, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Check opt-out status and unnotified resets in parallel with notification queries
  const [unreadResult, recentNotifications, currentOptOut, unnotifiedResets] = await Promise.all([
    db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
      .then((r) => r[0]),
    db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit: 20,
    }),
    getUserCurrentWeekOptOut(userId),
    getUnnotifiedResets(userId),
  ]);

  // Handle reset notifications for past-week opt-outs
  if (unnotifiedResets.length > 0) {
    const resetIds = unnotifiedResets.map((r) => r.id);

    await Promise.all([
      // Create notifications for each reset
      db.insert(notifications).values(
        unnotifiedResets.map((r) => ({
          userId,
          type: 'opt_out_reset' as const,
          title: "You're back in!",
          body: "Your opt-out has reset — you're opted in for this week's meals.",
          linkUrl: '/profile',
        })),
      ),
      // Mark them as notified
      db
        .update(weekOptOuts)
        .set({ resetNotified: true })
        .where(inArray(weekOptOuts.id, resetIds)),
    ]);
  }

  const isOptedOut = !!currentOptOut;

  return (
    <Providers>
      <AppShell
        userName={session.user.name}
        userRole={session.user.role ?? 'member'}
        notificationSlot={
          <NotificationBell
            unreadCount={unreadResult?.count ?? 0}
            notifications={recentNotifications}
          />
        }
        optOutBanner={isOptedOut ? <OptOutBanner /> : undefined}
      >
        {children}
      </AppShell>
    </Providers>
  );
}
