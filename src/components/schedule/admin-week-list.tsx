'use client';

import { deleteWeek } from '@/actions/schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatWeekRange } from '@/lib/schedule-utils';
import { useState } from 'react';

interface SwapDayInfo {
  id: string;
  label: string;
  dayOfWeek: number;
  recipe: { id: string; name: string } | null;
}

interface AdminWeekItem {
  id: string;
  startDate: Date;
  status: string;
  swapMode: string;
  swapDays: SwapDayInfo[];
  _count: { contributions: number };
}

interface AdminWeekListProps {
  weeks: AdminWeekItem[];
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'outline'> = {
  upcoming: 'outline',
  active: 'default',
  complete: 'success',
};

export function AdminWeekList({ weeks }: AdminWeekListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (weekId: string) => {
    setDeleting(weekId);
    setError('');
    const res = await deleteWeek(weekId);
    if (!res.success) setError(res.error);
    setDeleting(null);
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {weeks.map((week) => (
          <div key={week.id} className="space-y-1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {formatWeekRange(new Date(week.startDate))}
                </span>
                <span className="text-sm text-zinc-500">{week.swapMode} swap</span>
                <Badge variant={STATUS_VARIANT[week.status] ?? 'outline'}>
                  {week.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                loading={deleting === week.id}
                onClick={() => handleDelete(week.id)}
              >
                Delete
              </Button>
            </div>
            {week.swapDays.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-1">
                {week.swapDays.map((sd) => (
                  <span
                    key={sd.id}
                    className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                  >
                    <span className="font-medium">{sd.label.replace(' Swap', '')}:</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {sd.recipe?.name ?? 'No recipe'}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
