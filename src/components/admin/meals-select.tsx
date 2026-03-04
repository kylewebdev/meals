'use client';

import { adminUpdateMeals } from '@/actions/members';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface MealsSelectProps {
  userId: string;
  currentMeals: number;
}

export function MealsSelect({ userId, currentMeals }: MealsSelectProps) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMeals = Number(e.target.value);
    if (newMeals === currentMeals) return;

    setPending(true);
    setError('');
    const result = await adminUpdateMeals(userId, newMeals);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      e.target.value = String(currentMeals);
    } else {
      toast('Meals updated');
    }
  }

  return (
    <div>
      <Select
        defaultValue={String(currentMeals)}
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
