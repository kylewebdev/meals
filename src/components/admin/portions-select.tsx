'use client';

import { adminUpdatePortions } from '@/actions/members';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface PortionsSelectProps {
  userId: string;
  currentPortions: number;
}

export function PortionsSelect({ userId, currentPortions }: PortionsSelectProps) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPortions = Number(e.target.value);
    if (newPortions === currentPortions) return;

    setPending(true);
    setError('');
    const result = await adminUpdatePortions(userId, newPortions);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      e.target.value = String(currentPortions);
    } else {
      toast('Portions updated');
    }
  }

  return (
    <div>
      <Select
        defaultValue={String(currentPortions)}
        onChange={handleChange}
        disabled={pending}
        className="w-16"
      >
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </Select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
