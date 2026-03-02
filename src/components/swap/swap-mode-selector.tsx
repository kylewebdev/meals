'use client';

import { updateWeekSwapMode } from '@/actions/schedule';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SwapModeSelectorProps {
  weekId: string;
  currentMode: 'single' | 'dual';
}

export function SwapModeSelector({ weekId, currentMode }: SwapModeSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setResult(null);
    const newMode = currentMode === 'single' ? 'dual' : 'single';
    const res = await updateWeekSwapMode(weekId, newMode);
    if (res.success) {
      setResult({ message: `Switched to ${newMode} swap mode` });
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-500">
        Current mode: <span className="font-medium text-zinc-700 dark:text-zinc-300">{currentMode}</span>
      </span>
      <Button variant="secondary" size="sm" onClick={handleToggle} loading={loading}>
        Switch to {currentMode === 'single' ? 'dual' : 'single'}
      </Button>
      {result?.message && <span className="text-sm text-green-600">{result.message}</span>}
      {result?.error && <span className="text-sm text-red-600">{result.error}</span>}
    </div>
  );
}
