import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-utils';
import { getHousehold, getHouseholds } from '@/actions/households';
import { getOrCreateSwapSettings } from '@/lib/queries/swap-settings';
import { getBaseHouseholdData } from '@/lib/queries/scaling-context';
import { getHouseholdReviews } from '@/lib/queries/ratings';
import { ExtraPeopleForm } from '@/components/household/extra-people-form';
import { HouseholdReviews } from '@/components/household/household-reviews';
import { HouseholdRosterCard } from '@/components/household/household-roster-card';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { PendingInviteList } from '@/components/household/pending-invite-list';
import { EmptyState } from '@/components/ui/empty-state';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Co-op — Meals',
};

export default async function CoopPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = session.user.householdId;

  const [swapSettings, allHouseholds, headcountData] = await Promise.all([
    getOrCreateSwapSettings(),
    getHouseholds(),
    getBaseHouseholdData(),
  ]);

  const headcountMap = new Map(headcountData.map((h) => [h.householdId, h]));

  const [household, reviews] = householdId
    ? await Promise.all([getHousehold(householdId), getHouseholdReviews(householdId)])
    : [undefined, []] as const;

  const isHead = household?.headId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  const canManage = isHead || isAdmin;

  const now = new Date();
  const pendingInvites = household?.invites.filter((i) => !i.usedAt && i.expiresAt > now) ?? [];

  const otherHouseholds = allHouseholds.filter((h) => h.id !== householdId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Co-op</h2>

      {/* Swap info */}
      {(swapSettings.defaultTime || swapSettings.defaultLocation) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500">
          {swapSettings.defaultTime && (
            <span>Swap time: <span className="font-medium text-zinc-900 dark:text-zinc-100">{swapSettings.defaultTime}</span></span>
          )}
          {swapSettings.defaultLocation && (
            <span>Location: <span className="font-medium text-zinc-900 dark:text-zinc-100">{swapSettings.defaultLocation}</span></span>
          )}
        </div>
      )}

      {/* Your household — editable */}
      {household ? (
        <section>
          <div className="rounded-lg border-2 border-zinc-900 p-5 dark:border-zinc-100">
            <h3 className="text-lg font-semibold pb-4">
              {household.name}
              <span className="ml-2 text-sm font-normal text-zinc-500">Your household</span>
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">
                  Members ({household.members.length})
                </h4>
                <MemberList
                  members={household.members}
                  householdId={householdId!}
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
                        <PendingInviteList invites={pendingInvites} householdId={householdId!} />
                      </div>
                    )}
                    <div className="mt-4">
                      <InviteForm householdId={householdId!} />
                    </div>
                  </>
                )}
              </div>

              {canManage && (
                <>
                  <hr className="border-zinc-100 dark:border-zinc-800" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 pb-2">Extra People</h4>
                    <ExtraPeopleForm
                      householdId={householdId!}
                      extraPeople={household.extraPeople}
                    />
                  </div>
                </>
              )}

              <hr className="border-zinc-100 dark:border-zinc-800" />
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">
                  Our Reviews ({reviews.length})
                </h4>
                <HouseholdReviews reviews={reviews} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title={session.user.role === 'spectator'
            ? "You're viewing as a spectator"
            : 'Not assigned to a household'}
          description={session.user.role === 'spectator'
            ? 'You can browse recipes and participate in the workshop.'
            : 'Ask your admin to add you to a household.'}
        />
      )}

      {/* Other households — read-only roster */}
      {otherHouseholds.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold pb-3">Other Households</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherHouseholds.map((h) => (
              <HouseholdRosterCard
                key={h.id}
                household={h}
                headcount={headcountMap.get(h.id)}
              />
            ))}
          </div>
        </section>
      )}

      {otherHouseholds.length === 0 && household && (
        <p className="text-sm text-zinc-500">No other households have joined yet.</p>
      )}
    </div>
  );
}
