import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { DietaryForm } from '@/components/profile/dietary-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Get full user data with dietary fields
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userData) redirect('/login');

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Dietary Information</h3>
        </CardHeader>
        <CardContent>
          <DietaryForm
            allergies={userData.allergies ?? []}
            preferences={userData.dietaryPreferences ?? []}
            notes={userData.dietaryNotes ?? ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
