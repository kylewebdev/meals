import { getAllUsersWithDetails } from '@/actions/members';
import { requireAdmin } from '@/lib/auth-utils';
import { BackLink } from '@/components/ui/back-link';
import { redirect } from 'next/navigation';
import { ViewAsUserList } from './view-as-user-list';

export default async function ViewAsPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/up-next');

  const users = await getAllUsersWithDetails();
  const nonAdminUsers = users.filter((u) => u.role !== 'admin');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <BackLink href="/admin">Admin</BackLink>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          View as Member
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Select a member to see the app from their perspective.
        </p>
      </div>

      <ViewAsUserList users={nonAdminUsers} />
    </div>
  );
}
