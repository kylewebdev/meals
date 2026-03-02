'use client';

import { updatePickupInfo } from '@/actions/pickup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { useState } from 'react';

interface PickupFormProps {
  weekId: string;
  location: string | null;
  times: string | null;
  notes: string | null;
}

export function PickupForm({ weekId, location, times, notes }: PickupFormProps) {
  const [loc, setLoc] = useState(location ?? '');
  const [tm, setTm] = useState(times ?? '');
  const [nt, setNt] = useState(notes ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    await updatePickupInfo(weekId, {
      location: loc || undefined,
      times: tm || undefined,
      notes: nt || undefined,
    });
    setLoading(false);
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="pickup-location">Pickup location</Label>
        <Input
          id="pickup-location"
          value={loc}
          onChange={(e) => { setLoc(e.target.value); setSaved(false); }}
          placeholder="e.g., 123 Main St, front porch"
        />
      </div>
      <div>
        <Label htmlFor="pickup-times">Pickup times</Label>
        <Input
          id="pickup-times"
          value={tm}
          onChange={(e) => { setTm(e.target.value); setSaved(false); }}
          placeholder="e.g., 5:00 PM – 7:00 PM"
        />
      </div>
      <div>
        <Label htmlFor="pickup-notes">Notes</Label>
        <Textarea
          id="pickup-notes"
          value={nt}
          onChange={(e) => { setNt(e.target.value); setSaved(false); }}
          placeholder="Any additional instructions"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Pickup Info</Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
