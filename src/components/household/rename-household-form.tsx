'use client';

import { renameHousehold } from '@/actions/households';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface RenameHouseholdFormProps {
  householdId: string;
  currentName: string;
}

export function RenameHouseholdForm({ householdId, currentName }: RenameHouseholdFormProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === currentName) return;

    setLoading(true);
    setError('');
    const res = await renameHousehold(householdId, name);
    if (!res.success) setError(res.error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Household name"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <Button type="submit" size="sm" loading={loading} disabled={name.trim() === currentName}>
        Rename
      </Button>
    </form>
  );
}
