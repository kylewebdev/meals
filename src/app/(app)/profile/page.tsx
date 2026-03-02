import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { OptOutToggle } from '@/components/profile/opt-out-toggle';
import { PortionsForm } from '@/components/profile/portions-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentWeek } from '@/lib/queries/schedule';
import { getOptOutStatus } from '@/lib/queries/schedule';
import { formatWeekRange } from '@/lib/schedule-utils';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Get full user data + current week opt-out status
  const [userData, currentWeek] = await Promise.all([
    db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)
      .then((r) => r[0]),
    getCurrentWeek(),
  ]);

  if (!userData) redirect('/login');

  const isOptedOut = currentWeek
    ? await getOptOutStatus(session.user.id, currentWeek.id)
    : false;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Account</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Name</span>
            <span className="font-medium">{userData.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Email</span>
            <span className="font-medium">{userData.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Role</span>
            <Badge>{userData.role}</Badge>
          </div>
          <hr className="border-zinc-200 dark:border-zinc-700" />
          <PortionsForm currentPortions={userData.portionsPerMeal} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Weekly Opt-Out</h3>
        </CardHeader>
        <CardContent>
          <OptOutToggle
            currentWeekId={currentWeek?.id ?? null}
            weekLabel={currentWeek ? formatWeekRange(currentWeek.startDate) : null}
            isOptedOut={isOptedOut}
          />
        </CardContent>
      </Card>

    </div>
  );
}
