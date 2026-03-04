import type { HouseholdMeals } from '@/lib/queries/scaling-context';

interface MealBreakdownTableProps {
  householdMeals: HouseholdMeals[];
}

export function MealBreakdownTable({ householdMeals }: MealBreakdownTableProps) {
  const totalMeals = householdMeals.reduce((sum, hp) => sum + hp.meals, 0);
  const totalPeople = householdMeals.reduce((sum, hp) => sum + hp.memberCount, 0);
  const totalExtra = householdMeals.reduce((sum, hp) => sum + hp.extraMeals, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="py-1.5 pr-4 text-left font-medium text-zinc-500 dark:text-zinc-400">Household</th>
            <th className="py-1.5 pr-4 text-right font-medium text-zinc-500 dark:text-zinc-400">People</th>
            <th className="py-1.5 text-right font-medium text-zinc-500 dark:text-zinc-400">Meals</th>
          </tr>
        </thead>
        <tbody>
          {householdMeals.map((hp) => (
              <tr key={hp.householdId} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{hp.householdName}</td>
                <td className="py-1.5 pr-4 text-right text-zinc-600 dark:text-zinc-400">
                  {hp.memberCount}
                  {hp.extraMeals > 0 && (
                    <span className="text-zinc-400 dark:text-zinc-500"> (+{hp.extraMeals})</span>
                  )}
                </td>
                <td className="py-1.5 text-right text-zinc-600 dark:text-zinc-400">{hp.meals}</td>
              </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-200 dark:border-zinc-700">
            <td className="py-1.5 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">Total</td>
            <td className="py-1.5 pr-4 text-right font-semibold text-zinc-900 dark:text-zinc-100">
              {totalPeople}
              {totalExtra > 0 && (
                <span className="text-zinc-400 dark:text-zinc-500"> (+{totalExtra})</span>
              )}
            </td>
            <td className="py-1.5 text-right font-semibold text-zinc-900 dark:text-zinc-100">{totalMeals}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
