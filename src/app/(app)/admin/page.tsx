import { requireAdmin } from '@/lib/auth-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/up-next');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Admin</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/households">
          <Card variant="interactive" className="transition-colors">
            <CardHeader className="px-4 pt-4 md:px-5">
              <h3 className="text-lg font-semibold">Households</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5">
              <p className="text-sm text-zinc-500">
                Create and manage households, assign heads, invite members.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card variant="interactive" className="transition-colors">
            <CardHeader className="px-4 pt-4 md:px-5">
              <h3 className="text-lg font-semibold">Users</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5">
              <p className="text-sm text-zinc-500">
                Manage user roles, reset passwords, and view all accounts.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/rotation">
          <Card variant="interactive" className="transition-colors">
            <CardHeader className="px-4 pt-4 md:px-5">
              <h3 className="text-lg font-semibold">Rotation Settings</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5">
              <p className="text-sm text-zinc-500">
                Configure rotation schedule, generate weeks, and manage swap logistics.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/recipe-ratings">
          <Card variant="interactive" className="transition-colors">
            <CardHeader className="px-4 pt-4 md:px-5">
              <h3 className="text-lg font-semibold">Recipe Ratings</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5">
              <p className="text-sm text-zinc-500">
                View aggregate recipe ratings to identify favorites and removal candidates.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/view-as">
          <Card variant="interactive" className="transition-colors">
            <CardHeader className="px-4 pt-4 md:px-5">
              <h3 className="text-lg font-semibold">View as Member</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5">
              <p className="text-sm text-zinc-500">
                Preview the app as a specific member to see their experience.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
