import { getPortionCount } from '@/lib/schedule-utils';

interface PortionDisplayProps {
  headcount: number;
  coversFrom: number;
  coversTo: number;
}

export function PortionDisplay({ headcount, coversFrom, coversTo }: PortionDisplayProps) {
  const days = coversTo - coversFrom + 1;
  const portions = getPortionCount(headcount, coversFrom, coversTo);

  return (
    <div className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <span>{headcount} people</span>
      <span>&times;</span>
      <span>{days} {days === 1 ? 'day' : 'days'}</span>
      <span>=</span>
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{portions} portions</span>
    </div>
  );
}
