import { Badge } from '@/components/ui/badge';
import { formatWeekRange } from '@/lib/schedule-utils';
import Link from 'next/link';

interface WeekRowProps {
  id: string;
  startDate: Date;
  status: string;
  isCurrent: boolean;
}

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  upcoming: 'default',
  active: 'success',
  complete: 'warning',
};

export function WeekRow({ id, startDate, status, isCurrent }: WeekRowProps) {
  return (
    <Link
      href={`/week/${id}`}
      className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
        isCurrent ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{formatWeekRange(startDate)}</span>
      </div>
      <div className="flex items-center gap-2">
        {isCurrent && <Badge variant="success">Current</Badge>}
        <Badge variant={statusVariant[status] ?? 'default'}>{status}</Badge>
      </div>
    </Link>
  );
}
