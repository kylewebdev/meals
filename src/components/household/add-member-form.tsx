'use client';

import { assignMemberToHousehold } from '@/actions/members';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  householdId: string | null;
}

interface AddMemberFormProps {
  householdId: string;
  allUsers: User[];
  currentMemberIds: string[];
}

export function AddMemberForm({ householdId, allUsers, currentMemberIds }: AddMemberFormProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableUsers = allUsers.filter((u) => !currentMemberIds.includes(u.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    setError('');
    const res = await assignMemberToHousehold(selectedUserId, householdId);
    if (!res.success) {
      setError(res.error);
    } else {
      setSelectedUserId('');
    }
    setLoading(false);
  };

  if (availableUsers.length === 0) {
    return <p className="text-sm text-zinc-500">All users are already in this household.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
        <option value="">Select a user...</option>
        {availableUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email}){u.householdId ? ' — currently in another household' : ''}
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="sm" loading={loading} disabled={!selectedUserId}>
        Add to Household
      </Button>
    </form>
  );
}
