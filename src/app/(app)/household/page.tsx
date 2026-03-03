import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: 'My Household — Meals',
};
import { getHousehold } from '@/actions/households';
import { ExtraPeopleForm } from '@/components/household/extra-people-form';
import { HouseholdReviews } from '@/components/household/household-reviews';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { PendingInviteList } from '@/components/household/pending-invite-list';
import { EmptyState } from '@/components/ui/empty-state';
import { getHouseholdReviews } from '@/lib/queries/ratings';
import { redirect } from 'next/navigation';

export default async function HouseholdPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = session.user.householdId;
  if (!householdId) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">My Household</h2>
        <EmptyState
          title="Not assigned to a household"
          description="Ask your admin to add you to a household."
        />
      </div>
    );
  }

  const [household, reviews] = await Promise.all([
    getHousehold(householdId),
    getHouseholdReviews(householdId),
  ]);
  if (!household) redirect('/dashboard');

  const isHead = household.headId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  const canManage = isHead || isAdmin;

  const now = new Date();
  const pendingInvites = household.invites.filter((i) => !i.usedAt && i.expiresAt > now);

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">{household.name}</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold pb-3">Members ({household.members.length})</h3>
          <MemberList
            members={household.members}
            householdId={householdId}
            headId={household.headId}
            canManage={canManage}
            currentUserId={session.user.id}
          />
          {canManage && (
            <>
              {pendingInvites.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500 pb-2">
                    Pending invites ({pendingInvites.length})
                  </h4>
                  <PendingInviteList invites={pendingInvites} householdId={householdId} />
                </div>
              )}
              <div className="mt-4">
                <InviteForm householdId={householdId} />
              </div>
            </>
          )}
        </div>

        {canManage && (
          <>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div>
              <h3 className="text-lg font-semibold pb-3">Extra People</h3>
              <ExtraPeopleForm
                householdId={householdId}
                extraPeople={household.extraPeople}
              />
            </div>
          </>
        )}

        <hr className="border-zinc-100 dark:border-zinc-800" />

        <div>
          <h3 className="text-lg font-semibold pb-3">Our Reviews ({reviews.length})</h3>
          <HouseholdReviews reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
