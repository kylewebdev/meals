import { getHousehold } from '@/actions/households';
import { getAllUsers } from '@/actions/members';
import { requireAdmin } from '@/lib/auth-utils';
import { AddMemberForm } from '@/components/household/add-member-form';
import { HeadSelector } from '@/components/household/head-selector';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { PendingInviteList } from '@/components/household/pending-invite-list';
import { RenameHouseholdForm } from '@/components/household/rename-household-form';
import { BackLink } from '@/components/ui/back-link';
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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <BackLink href="/admin/households">Households</BackLink>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{household.name}</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold pb-3">Household Name</h3>
        <RenameHouseholdForm householdId={householdId} currentName={household.name} />
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold pb-3">Members ({household.members.length})</h3>
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
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold pb-3">Head of Household</h3>
            <HeadSelector
              householdId={householdId}
              members={household.members}
              currentHeadId={household.headId}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold pb-3">Add Existing User</h3>
            <p className="mb-3 text-sm text-zinc-500">
              Move an existing user into this household (works for admins in other households too).
            </p>
            <AddMemberForm
              householdId={householdId}
              allUsers={allUsers}
              currentMemberIds={currentMemberIds}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold pb-3">Invite New Members</h3>
            <InviteForm householdId={householdId} />
            {pendingInvites.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-500 pb-2">
                  Pending invites ({pendingInvites.length})
                </h4>
                <PendingInviteList invites={pendingInvites} householdId={householdId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
