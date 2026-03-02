'use client';

import { createHousehold } from '@/actions/households';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

export function CreateHouseholdForm() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await createHousehold({ name });

    if (!res.success) {
      setError(res.error);
    } else {
      setName('');
      toast('Household created');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="household-name">Household name</Label>
        <div className="flex gap-2">
          <Input
            id="household-name"
            required
            placeholder="The Smith Family"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" loading={loading}>
            Create
          </Button>
        </div>
      </div>
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
    </form>
  );
}
