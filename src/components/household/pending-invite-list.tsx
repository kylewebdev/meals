'use client';

import { removeInvite } from '@/actions/invites';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
}

interface PendingInviteListProps {
  invites: PendingInvite[];
  householdId: string;
}

export function PendingInviteList({ invites, householdId }: PendingInviteListProps) {
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRemove = async (inviteId: string) => {
    setRemovingId(inviteId);
    await removeInvite(inviteId, householdId);
    setRemovingId(null);
    toast('Invite removed');
  };

  const getInviteUrl = (token: string) => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : '';
    return `${baseUrl}/register?token=${token}`;
  };

  const handleCopyUrl = async (invite: PendingInvite) => {
    const url = getInviteUrl(invite.token);
    await navigator.clipboard.writeText(url);
    setCopiedId(invite.id);
    toast('Invite link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatExpiry = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  return (
    <ul className="space-y-2">
      {invites.map((invite) => (
        <li
          key={invite.id}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{invite.email}</span>
              <Badge variant="outline">Pending</Badge>
              {invite.role === 'admin' && <Badge>Admin</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyUrl(invite)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {copiedId === invite.id ? 'Copied!' : 'Copy link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                loading={removingId === invite.id}
                onClick={() => handleRemove(invite.id)}
                className="text-zinc-400 hover:text-red-500"
              >
                Remove
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-zinc-400">{formatExpiry(invite.expiresAt)}</p>
        </li>
      ))}
    </ul>
  );
}
