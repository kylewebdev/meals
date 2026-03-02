import { getAllUsersWithDetails } from '@/actions/members';
import { requireAdmin } from '@/lib/auth-utils';
import { RoleSelect } from '@/components/admin/role-select';
import { ResetPasswordButton } from '@/components/admin/reset-password-button';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const users = await getAllUsersWithDetails();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">
          Admin
        </Link>
        <span className="text-zinc-300">/</span>
        <h2 className="text-2xl font-bold">Users ({users.length})</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">All Users</h3>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-zinc-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Name</th>
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Email</th>
                    <th className="pb-2 pr-4 font-medium text-zinc-500">Household</th>
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
                      <td className="py-3 pr-4 text-zinc-500">{u.email}</td>
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
        </CardContent>
      </Card>
    </div>
  );
}
