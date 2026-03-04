'use client';

import { enableViewAs } from '@/actions/view-as';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  householdName: string | null;
}

export function ViewAsUserList({ users }: { users: User[] }) {
  const router = useRouter();

  async function handleSelect(userId: string) {
    const result = await enableViewAs(userId);
    if (result.success) {
      router.push('/up-next');
      router.refresh();
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No non-admin users found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
            <th className="pb-2 pr-4 font-medium">Name</th>
            <th className="pb-2 pr-4 font-medium">Email</th>
            <th className="pb-2 pr-4 font-medium">Household</th>
            <th className="pb-2 font-medium">Role</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b border-zinc-100 dark:border-zinc-800"
            >
              <td className="py-3 pr-4 font-medium">{u.name}</td>
              <td className="py-3 pr-4 text-zinc-500">{u.email}</td>
              <td className="py-3 pr-4 text-zinc-500">
                {u.householdName ?? '—'}
              </td>
              <td className="py-3 pr-4 text-zinc-500">{u.role}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => handleSelect(u.id)}
                  className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  View as
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
