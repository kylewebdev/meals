import { getHousehold } from '@/actions/households';
import { getAllUsers } from '@/actions/members';
import { requireAdmin } from '@/lib/auth-utils';
import { AddMemberForm } from '@/components/household/add-member-form';
import { HeadSelector } from '@/components/household/head-selector';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { PendingInviteList } from '@/components/household/pending-invite-list';
import { RenameHouseholdForm } from '@/components/household/rename-household-form';
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
        <Link href="/admin/households" className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0z" clipRule="evenodd" /></svg>
          Households
        </Link>
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
              <PendingInviteList invites={pendingInvites} householdId={householdId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
