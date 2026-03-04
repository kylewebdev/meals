import { db } from '@/lib/db';
import { contributions, notifications, recipes, swapDays, weeks } from '@/lib/db/schema';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from '@/components/layout/providers';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { getEffectiveSession } from '@/lib/auth-utils';
import { and, eq, gte, isNull, count } from 'drizzle-orm';
import { getThisMonday } from '@/lib/schedule-utils';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, viewAsName } = await getEffectiveSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;
  const householdId = session.user.householdId;
  const userRole = session.user.role ?? 'member';
  const isAdmin = userRole === 'admin';

  const [unreadResult, pendingReviewResult, hasUpcomingCook] = await Promise.all([
    db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
        isNull(notifications.archivedAt),
      ))
      .then((r) => r[0]?.count ?? 0),

    isAdmin
      ? db
          .select({ count: count() })
          .from(recipes)
          .where(eq(recipes.status, 'pending_review'))
          .then((r) => r[0]?.count ?? 0)
      : Promise.resolve(0),

    householdId
      ? db
          .select({ count: count() })
          .from(contributions)
          .innerJoin(swapDays, eq(contributions.swapDayId, swapDays.id))
          .innerJoin(weeks, eq(swapDays.weekId, weeks.id))
          .where(and(
            eq(contributions.householdId, householdId),
            gte(weeks.startDate, getThisMonday()),
          ))
          .then((r) => (r[0]?.count ?? 0) > 0)
      : Promise.resolve(false),
  ]);

  return (
    <Providers>
      <AppShell
        userName={session.user.name}
        userRole={userRole}
        pendingRecipeCount={pendingReviewResult}
        hasUpcomingCook={hasUpcomingCook}
        viewAsName={viewAsName}
        notificationSlot={
          <NotificationBell
            unreadCount={unreadResult}
          />
        }
      >
        {children}
      </AppShell>
    </Providers>
  );
}
