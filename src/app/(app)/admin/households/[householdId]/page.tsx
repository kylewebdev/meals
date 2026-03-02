import { getHousehold } from '@/actions/households';
import { getAllUsers } from '@/actions/members';
import { requireAdmin } from '@/lib/auth-utils';
import { AddMemberForm } from '@/components/household/add-member-form';
import { HeadSelector } from '@/components/household/head-selector';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { PendingInviteList } from '@/components/household/pending-invite-list';
import { RenameHouseholdForm } from '@/components/household/rename-household-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function AdminHouseholdDetailPage({
  params,
}: {
  params: Promise<{ householdId: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const { householdId } = await params;
  const [household, allUsers] = await Promise.all([
    getHousehold(householdId),
    getAllUsers(),
  ]);
  if (!household) notFound();

  const now = new Date();
  const pendingInvites = household.invites.filter((i) => !i.usedAt && i.expiresAt > now);
  const currentMemberIds = household.members.map((m) => m.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/households" className="text-sm text-zinc-500 hover:text-zinc-700">
          &larr; Households
        </Link>
        <h2 className="mt-1 text-2xl font-bold">{household.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Household Name</h3>
        </CardHeader>
        <CardContent>
          <RenameHouseholdForm householdId={householdId} currentName={household.name} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Members ({household.members.length})</h3>
          </CardHeader>
          <CardContent>
            {household.members.length === 0 ? (
              <p className="text-sm text-zinc-500">No members yet. Send an invite or add one below.</p>
            ) : (
              <MemberList
                members={household.members}
                householdId={householdId}
                headId={household.headId}
                canManage={true}
                currentUserId={auth.data.user.id}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Head of Household</h3>
            </CardHeader>
            <CardContent>
              <HeadSelector
                householdId={householdId}
                members={household.members}
                currentHeadId={household.headId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Add Existing User</h3>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-zinc-500">
                Move an existing user into this household (works for admins in other households too).
              </p>
              <AddMemberForm
                householdId={householdId}
                allUsers={allUsers}
                currentMemberIds={currentMemberIds}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Invite New Members</h3>
            </CardHeader>
            <CardContent>
              <InviteForm householdId={householdId} />
              {pendingInvites.length > 0 && (
                <PendingInviteList invites={pendingInvites} householdId={householdId} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
