'use client';

import { updateUserRole } from '@/actions/members';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface RoleSelectProps {
  userId: string;
  currentRole: 'admin' | 'member' | 'spectator';
  isSelf: boolean;
}

export function RoleSelect({ userId, currentRole, isSelf }: RoleSelectProps) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as 'admin' | 'member' | 'spectator';
    if (newRole === currentRole) return;

    setPending(true);
    setError('');
    const result = await updateUserRole(userId, newRole);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      e.target.value = currentRole;
    } else {
      toast('Role updated');
    }
  }

  return (
    <div>
      <Select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={pending || isSelf}
        className="w-28"
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="spectator">Spectator</option>
      </Select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
