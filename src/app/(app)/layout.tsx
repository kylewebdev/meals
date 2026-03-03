import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from '@/components/layout/providers';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { and, eq, isNull, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  const unreadResult = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      isNull(notifications.readAt),
      isNull(notifications.archivedAt),
    ))
    .then((r) => r[0]);

  return (
    <Providers>
      <AppShell
        userName={session.user.name}
        userRole={session.user.role ?? 'member'}
        notificationSlot={
          <NotificationBell
            unreadCount={unreadResult?.count ?? 0}
          />
        }
      >
        {children}
      </AppShell>
    </Providers>
  );
}
