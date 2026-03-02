'use client';

import { updateSwapSettings } from '@/actions/swap-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface SettingsFormProps {
  startDate: string;
  swapMode: string;
  householdOrderMode: string;
  defaultLocation: string | null;
  defaultTime: string | null;
}

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

export function SettingsForm({
  startDate,
  swapMode,
  householdOrderMode,
  defaultLocation,
  defaultTime,
}: SettingsFormProps) {
  const [form, setForm] = useState({
    startDate: toDateInputValue(startDate),
    swapMode,
    householdOrderMode,
    defaultLocation: defaultLocation ?? '',
    defaultTime: defaultTime ?? '',
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const res = await updateSwapSettings({
      startDate: form.startDate,
      swapMode: form.swapMode as 'single' | 'dual',
      householdOrderMode: form.householdOrderMode as 'fixed' | 'random',
      defaultLocation: form.defaultLocation,
      defaultTime: form.defaultTime,
    });
    if (res.success) {
      toast('Settings saved');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="swap-mode">Swap Mode</Label>
          <Select
            id="swap-mode"
            value={form.swapMode}
            onChange={(e) => setForm({ ...form, swapMode: e.target.value })}
          >
            <option value="single">Single (Sun swap, Mon-Fri)</option>
            <option value="dual">Dual (Sat + Wed swaps)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="hh-order-mode">Household Order Mode</Label>
          <Select
            id="hh-order-mode"
            value={form.householdOrderMode}
            onChange={(e) => setForm({ ...form, householdOrderMode: e.target.value })}
          >
            <option value="fixed">Fixed</option>
            <option value="random">Random</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="default-location">Default Location</Label>
          <Input
            id="default-location"
            value={form.defaultLocation}
            onChange={(e) => setForm({ ...form, defaultLocation: e.target.value })}
            placeholder="e.g., Community Center"
          />
        </div>
        <div>
          <Label htmlFor="default-time">Default Time</Label>
          <Input
            id="default-time"
            value={form.defaultTime}
            onChange={(e) => setForm({ ...form, defaultTime: e.target.value })}
            placeholder="e.g., 5:00 PM"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Settings</Button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
