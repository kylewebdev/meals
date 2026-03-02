import { cn } from '@/lib/utils';

interface SwapDayChipProps {
  label: string;
  contributionCount: number;
  totalHouseholds: number;
}

export function SwapDayChip({ label, contributionCount, totalHouseholds }: SwapDayChipProps) {
  const shortLabel = label.replace(' Swap', '').slice(0, 3);

  let variant: 'empty' | 'partial' | 'full' = 'empty';
  if (contributionCount > 0 && contributionCount >= totalHouseholds) variant = 'full';
  else if (contributionCount > 0) variant = 'partial';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight',
        variant === 'full' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        variant === 'partial' && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        variant === 'empty' && 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
      )}
    >
      {shortLabel} {contributionCount}/{totalHouseholds}
    </span>
  );
}
