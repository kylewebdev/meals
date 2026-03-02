import { cn } from '@/lib/utils';

interface ContributionEntry {
  householdName: string;
  recipeName: string | null;
}

interface SwapDayDetailProps {
  label: string;
  contributions: ContributionEntry[];
}

export function SwapDayDetail({ label, contributions }: SwapDayDetailProps) {
  const shortLabel = label.replace(' Swap', '').slice(0, 3);
  const hasRecipes = contributions.some((c) => c.recipeName);

  return (
    <div className="space-y-0.5">
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight',
          hasRecipes
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
        )}
      >
        {shortLabel}
      </span>
      {contributions.length > 0 && (
        <div className="space-y-0">
          {contributions.slice(0, 2).map((c) => (
            <p
              key={c.householdName}
              className="truncate text-[10px] leading-tight text-zinc-700 dark:text-zinc-300"
            >
              {c.householdName}: {c.recipeName ?? 'TBD'}
            </p>
          ))}
          {contributions.length > 2 && (
            <p className="truncate text-[9px] leading-tight text-zinc-400">
              +{contributions.length - 2} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
