import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { PortionsForm } from '@/components/profile/portions-form';
import { Badge } from '@/components/ui/badge';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
    .then((r) => r[0]);

  if (!userData) redirect('/login');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">My Profile</h2>

      <div>
        <h3 className="text-lg font-semibold pb-3">Account</h3>
        <div className="space-y-2">
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
          <hr className="border-zinc-100 dark:border-zinc-800" />
          <PortionsForm currentPortions={userData.portionsPerMeal} />
        </div>
      </div>
    </div>
  );
}
