import { getSession } from '@/lib/auth-utils';
import { getHousehold } from '@/actions/households';
import { ExtraPortionsForm } from '@/components/household/extra-portions-form';
import { InviteForm } from '@/components/household/invite-form';
import { MemberList } from '@/components/household/member-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { redirect } from 'next/navigation';

export default async function HouseholdPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const householdId = session.user.householdId;
  if (!householdId) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Household</h2>
        <EmptyState
          title="Not assigned to a household"
          description="Ask your admin to add you to a household."
        />
      </div>
    );
  }

  const household = await getHousehold(householdId);
  if (!household) redirect('/dashboard');

  const isHead = household.headId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  const canManage = isHead || isAdmin;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{household.name}</h2>

      <Card>
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
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Extra Portions</h3>
          </CardHeader>
          <CardContent>
            <ExtraPortionsForm
              householdId={householdId}
              currentExtraPortions={household.extraPortions}
            />
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Invite Members</h3>
          </CardHeader>
          <CardContent>
            <InviteForm householdId={householdId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
