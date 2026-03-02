'use client';

import { removeInvite } from '@/actions/invites';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PendingInvite {
  id: string;
  email: string;
  role: string;
}

interface PendingInviteListProps {
  invites: PendingInvite[];
  householdId: string;
}

export function PendingInviteList({ invites, householdId }: PendingInviteListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (inviteId: string) => {
    setRemovingId(inviteId);
    await removeInvite(inviteId, householdId);
    setRemovingId(null);
  };

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-medium text-zinc-500">Pending invites</h4>
      <ul className="space-y-1">
        {invites.map((invite) => (
          <li key={invite.id} className="flex items-center gap-2 text-sm">
            <span>{invite.email}</span>
            <Badge variant="outline">{invite.role}</Badge>
            <Button
              variant="ghost"
              size="sm"
              loading={removingId === invite.id}
              onClick={() => handleRemove(invite.id)}
              className="ml-auto text-zinc-400 hover:text-red-500"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
