import type { Metadata } from 'next';
import { getAllUsersWithDetails } from '@/actions/members';

export const metadata: Metadata = {
  title: 'Users — Meals',
};
import { requireAdmin } from '@/lib/auth-utils';
import { RoleSelect } from '@/components/admin/role-select';
import { ResetPasswordButton } from '@/components/admin/reset-password-button';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { MealsSelect } from '@/components/admin/meals-select';
import { InviteForm } from '@/components/household/invite-form';
import { BackLink } from '@/components/ui/back-link';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/up-next');

  const users = await getAllUsersWithDetails();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <BackLink href="/admin">Admin</BackLink>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Users ({users.length})</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold pb-3">All Users</h3>
        {users.length === 0 ? (
          <p className="text-sm text-zinc-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left dark:border-zinc-800">
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Name</th>
                    <th className="hidden pb-2 pr-4 font-medium text-zinc-500 md:table-cell">Email</th>
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Household</th>
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Meals</th>
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Role</th>
                    <th className="pb-2 font-medium text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.name}</span>
                          {u.id === auth.data.user.id && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                      </td>
                      <td className="hidden py-3 pr-4 text-zinc-500 md:table-cell">{u.email}</td>
                      <td className="py-3 pr-4">
                        {u.householdName ? (
                          <Link
                            href={`/admin/households/${u.householdId}`}
                            className="text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                          >
                            {u.householdName}
                          </Link>
                        ) : (
                          <span className="text-zinc-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <MealsSelect
                          userId={u.id}
                          currentMeals={u.meals}
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <RoleSelect
                          userId={u.id}
                          currentRole={u.role}
                          isSelf={u.id === auth.data.user.id}
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <ResetPasswordButton userId={u.id} userName={u.name} />
                          <DeleteUserButton
                            userId={u.id}
                            userName={u.name}
                            isSelf={u.id === auth.data.user.id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold pb-3">Invite Spectator</h3>
        <InviteForm role="spectator" />
      </div>
    </div>
  );
}
