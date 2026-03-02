'use client';

import { updateSwapDayInfo } from '@/actions/swap-days';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface SwapDayFormProps {
  swapDayId: string;
  label: string;
  location: string | null;
  time: string | null;
  notes: string | null;
}

export function SwapDayForm({ swapDayId, label, location, time, notes }: SwapDayFormProps) {
  const { toast } = useToast();
  const [loc, setLoc] = useState(location ?? '');
  const [tm, setTm] = useState(time ?? '');
  const [nt, setNt] = useState(notes ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updateSwapDayInfo(swapDayId, {
      location: loc || undefined,
      time: tm || undefined,
      notes: nt || undefined,
    });
    setLoading(false);
    toast('Logistics saved');
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h4 className="text-sm font-semibold">{label} — Logistics</h4>
      <div>
        <Label htmlFor={`loc-${swapDayId}`}>Location</Label>
        <Input
          id={`loc-${swapDayId}`}
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="e.g., Community center parking lot"
        />
      </div>
      <div>
        <Label htmlFor={`time-${swapDayId}`}>Time</Label>
        <Input
          id={`time-${swapDayId}`}
          value={tm}
          onChange={(e) => setTm(e.target.value)}
          placeholder="e.g., 5:00 PM"
        />
      </div>
      <div>
        <Label htmlFor={`notes-${swapDayId}`}>Notes</Label>
        <Textarea
          id={`notes-${swapDayId}`}
          value={nt}
          onChange={(e) => setNt(e.target.value)}
          placeholder="Additional logistics"
        />
      </div>
      <Button onClick={handleSave} loading={loading}>Save</Button>
    </div>
  );
}
