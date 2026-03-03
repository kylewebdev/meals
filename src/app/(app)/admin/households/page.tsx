import { getHouseholds } from '@/actions/households';
import { requireAdmin } from '@/lib/auth-utils';
import { CreateHouseholdForm } from '@/components/household/create-household-form';
import { HouseholdCard } from '@/components/household/household-card';
import { EmptyState } from '@/components/ui/empty-state';
import { redirect } from 'next/navigation';

export default async function AdminHouseholdsPage() {
  const auth = await requireAdmin();
  if (!auth.success) redirect('/dashboard');

  const householdsList = await getHouseholds();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Households</h2>
      </div>

      <CreateHouseholdForm />

      {householdsList.length === 0 ? (
        <EmptyState
          title="No households yet"
          description="Create your first household to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {householdsList.map((h) => (
            <HouseholdCard
              key={h.id}
              id={h.id}
              name={h.name}
              memberCount={h.members.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
