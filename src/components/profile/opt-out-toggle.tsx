'use client';

import { optOutOfWeek, optBackIn } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface OptOutToggleProps {
  currentWeekId: string | null;
  weekLabel: string | null;
  isOptedOut: boolean;
}

export function OptOutToggle({ currentWeekId, weekLabel, isOptedOut: initial }: OptOutToggleProps) {
  const { toast } = useToast();
  const [isOptedOut, setIsOptedOut] = useState(initial);
  const [loading, setLoading] = useState(false);

  if (!currentWeekId) {
    return (
      <p className="text-sm text-zinc-500">No active week — nothing to opt out of.</p>
    );
  }

  const handleToggle = async () => {
    setLoading(true);
    if (isOptedOut) {
      await optBackIn(currentWeekId);
      setIsOptedOut(false);
      toast('Opted back in');
    } else {
      await optOutOfWeek(currentWeekId);
      setIsOptedOut(true);
      toast('Opted out of this week');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isOptedOut
            ? 'You\'ve opted out of this week\'s meals.'
            : 'You\'re opted in for this week\'s meals.'}
        </p>
        {weekLabel && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{weekLabel}</p>
        )}
      </div>
      <Button
        variant={isOptedOut ? 'primary' : 'secondary'}
        size="sm"
        loading={loading}
        onClick={handleToggle}
      >
        {isOptedOut ? 'Opt Back In' : 'Opt Out'}
      </Button>
    </div>
  );
}
