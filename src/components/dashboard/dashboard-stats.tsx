import { Badge } from '@/components/ui/badge';
import type { DashboardStats } from '@/lib/queries/dashboard';

interface DashboardStatsProps {
  stats: DashboardStats;
}

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  upcoming: 'default',
  active: 'success',
  complete: 'warning',
};

export function DashboardStatsRow({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Recipes" value={stats.recipeCount} />
      <StatTile label="Household members" value={stats.householdMemberCount} />
      <StatTile label="Households" value={stats.householdCount} />
      <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">This week</p>
        {stats.currentWeekStatus ? (
          <Badge variant={statusVariant[stats.currentWeekStatus] ?? 'default'} className="mt-1">
            {stats.currentWeekStatus}
          </Badge>
        ) : (
          <p className="text-lg font-semibold">—</p>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
