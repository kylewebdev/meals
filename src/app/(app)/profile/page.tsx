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
        <dl className="space-y-2">
          <div className="flex items-center gap-6">
            <dt className="w-[100px] shrink-0 text-right text-sm text-zinc-500">Name</dt>
            <dd className="font-medium">{userData.name}</dd>
          </div>
          <div className="flex items-center gap-6">
            <dt className="w-[100px] shrink-0 text-right text-sm text-zinc-500">Email</dt>
            <dd className="font-medium">{userData.email}</dd>
          </div>
          <div className="flex items-center gap-6">
            <dt className="w-[100px] shrink-0 text-right text-sm text-zinc-500">Role</dt>
            <dd><Badge>{userData.role}</Badge></dd>
          </div>
          <hr className="my-4 border-zinc-100 dark:border-zinc-800" />
          <PortionsForm currentPortions={userData.portionsPerMeal} />
        </dl>
      </div>
    </div>
  );
}
