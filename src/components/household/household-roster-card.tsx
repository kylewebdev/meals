import type { BaseHouseholdData } from '@/lib/queries/scaling-context';
import type { HouseholdListItem } from '@/actions/households';

interface HouseholdRosterCardProps {
  household: HouseholdListItem;
  headcount?: BaseHouseholdData;
}

export function HouseholdRosterCard({ household, headcount }: HouseholdRosterCardProps) {
  const meals = headcount?.baseMeals ?? household.members.length;

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{household.name}</h4>
        <span className="text-sm text-zinc-500">
          {meals} {meals === 1 ? 'meal' : 'meals'}
        </span>
      </div>
      {household.members.length > 0 && (
        <p className="mt-1 text-sm text-zinc-500">
          {household.members.map((m) => m.name).join(', ')}
        </p>
      )}
    </div>
  );
}
