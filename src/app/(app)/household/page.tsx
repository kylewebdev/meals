import { getSession } from '@/lib/auth-utils';
import { getHousehold } from '@/actions/households';
import { ExtraPeopleForm } from '@/components/household/extra-people-form';
import { HouseholdReviews } from '@/components/household/household-reviews';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { getHouseholdReviews } from '@/lib/queries/ratings';
import { redirect } from 'next/navigation';

export default async function HouseholdPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = session.user.householdId;
  if (!householdId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 className="text-2xl font-bold">My Household</h2>
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

  return (
    <div className={`mx-auto max-w-5xl${canManage ? ' 2xl:max-w-[83.5rem]' : ''}`}>
      <h2 className="mb-6 text-2xl font-bold">{household.name}</h2>
      <div className="space-y-6">
        <div className={canManage ? '2xl:flex 2xl:items-start 2xl:gap-6' : ''}>
          <Card className="min-w-0 2xl:flex-1">
            <CardHeader>
              <h3 className="font-semibold">Members ({household.members.length})</h3>
            </CardHeader>
            <CardContent>
              <MemberList
                members={household.members}
                householdId={householdId}
                headId={household.headId}
                canManage={canManage}
                currentUserId={session.user.id}
              />
            </CardContent>
          </Card>

          {canManage && (
            <aside className="mt-6 shrink-0 2xl:mt-0 2xl:w-72">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Invite Members</h3>
                </CardHeader>
                <CardContent>
                  <InviteForm householdId={householdId} />
                </CardContent>
              </Card>
            </aside>
          )}
        </div>

        {canManage && (
          <Card className="max-w-5xl">
            <CardHeader>
              <h3 className="font-semibold">Extra People</h3>
            </CardHeader>
            <CardContent>
              <ExtraPeopleForm
                householdId={householdId}
                extraPeople={household.extraPeople}
              />
            </CardContent>
          </Card>
        )}

        <Card className="max-w-5xl">
          <CardHeader>
            <h3 className="font-semibold">Our Reviews ({reviews.length})</h3>
          </CardHeader>
          <CardContent>
            <HouseholdReviews reviews={reviews} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
