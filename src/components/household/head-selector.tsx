'use client';

import { setHouseholdHead } from '@/actions/households';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface Member {
  id: string;
  name: string;
}

interface HeadSelectorProps {
  householdId: string;
  members: Member[];
  currentHeadId: string | null;
}

export function HeadSelector({ householdId, members, currentHeadId }: HeadSelectorProps) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(currentHeadId ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await setHouseholdHead(householdId, selectedId || null);
    setLoading(false);
    toast('Household head updated');
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="head-select">Household head</Label>
        <Select
          id="head-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">None</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Select>
      </div>
      <Button
        onClick={handleSave}
        loading={loading}
        disabled={selectedId === (currentHeadId ?? '')}
      >
        Save
      </Button>
    </div>
  );
}
