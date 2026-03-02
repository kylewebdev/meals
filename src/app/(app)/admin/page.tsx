import { requireAdmin } from '@/lib/auth-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/households">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <h3 className="font-semibold">Households</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Create and manage households, assign heads, invite members.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/rotation">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <h3 className="font-semibold">Rotation & Schedule</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Set the cooking rotation order and generate weekly schedule.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
