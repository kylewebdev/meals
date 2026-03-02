'use client';

import { deleteWeek } from '@/actions/schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatWeekRange } from '@/lib/schedule-utils';
import { useState } from 'react';

interface WeekItem {
  id: string;
  startDate: Date;
  status: string;
  household: { id: string; name: string };
  _count: { mealPlanEntries: number };
}

interface WeekListProps {
  weeks: WeekItem[];
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'outline'> = {
  upcoming: 'outline',
  active: 'default',
  complete: 'success',
};

export function WeekList({ weeks }: WeekListProps) {
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
        {weeks.map((week) => {
          const hasMeals = week._count.mealPlanEntries > 0;
          return (
            <div key={week.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div>
                  <span className="font-medium">
                    {formatWeekRange(new Date(week.startDate))}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500">{week.household.name}</span>
                </div>
                <Badge variant={STATUS_VARIANT[week.status] ?? 'outline'}>
                  {week.status}
                </Badge>
                {hasMeals && (
                  <Badge variant="outline">
                    {week._count.mealPlanEntries} meal{week._count.mealPlanEntries !== 1 ? 's' : ''}
                  </Badge>
                )}
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
          );
        })}
      </div>
    </div>
  );
}
