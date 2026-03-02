import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { AppShell } from '@/components/layout/app-shell';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { and, desc, eq, isNull, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const [unreadResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id),
        isNull(notifications.readAt),
      ),
    );

  const recentNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 20,
  });

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.user.role ?? 'member'}
      notificationSlot={
        <NotificationBell
          unreadCount={unreadResult?.count ?? 0}
          notifications={recentNotifications}
        />
      }
    >
      {children}
    </AppShell>
  );
}
