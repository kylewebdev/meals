'use client';

import { updateExtraPortions } from '@/actions/households';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface ExtraPortionsFormProps {
  householdId: string;
  currentExtraPortions: number;
}

export function ExtraPortionsForm({ householdId, currentExtraPortions }: ExtraPortionsFormProps) {
  const [value, setValue] = useState(currentExtraPortions);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value === currentExtraPortions) return;

    setLoading(true);
    setError('');
    const res = await updateExtraPortions(householdId, value);
    if (!res.success) {
      setError(res.error);
    } else {
      toast('Extra portions updated');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Extra portions for household members who aren&apos;t app users (e.g. kids).
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={0}
            max={10}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <Button type="submit" loading={loading} disabled={value === currentExtraPortions}>
          Save
        </Button>
      </div>
    </form>
  );
}
