'use client';

import { updatePortionsPerMeal } from '@/actions/profile';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const OPTIONS = [0, 1, 2, 3] as const;

interface PortionsFormProps {
  currentPortions: number;
}

export function PortionsForm({ currentPortions }: PortionsFormProps) {
  const { toast } = useToast();
  const [portions, setPortions] = useState(currentPortions);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (value: number) => {
    if (value === portions || loading) return;
    setPortions(value);
    setLoading(true);
    await updatePortionsPerMeal(value);
    setLoading(false);
    toast('Portions updated');
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Meals
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          How many meals you'd like to get per day.
        </p>
      </div>
      <div className="inline-flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
        {OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            disabled={loading}
            onClick={() => handleSelect(n)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium transition-colors',
              'disabled:cursor-not-allowed',
              'not-first:border-l not-first:border-zinc-300 dark:not-first:border-zinc-700',
              n === portions
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
