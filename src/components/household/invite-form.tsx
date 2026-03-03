'use client';

import { createInvite } from '@/actions/invites';
import type { UserRole } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface InviteFormProps {
  householdId?: string;
  role?: UserRole;
}

export function InviteForm({ householdId, role }: InviteFormProps) {
  const isSpectator = role === 'spectator';
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await createInvite({ email, householdId, role });

    if (res.success) {
      setResult({ url: res.data.inviteUrl });
      setEmail('');
      toast(isSpectator ? 'Spectator invite created' : 'Invite sent');
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor={isSpectator ? 'spectator-email' : 'invite-email'}>
          {isSpectator ? 'Invite spectator by email' : 'Invite by email'}
        </Label>
        <div className="flex gap-2">
          <Input
            id={isSpectator ? 'spectator-email' : 'invite-email'}
            type="email"
            required
            placeholder={isSpectator ? 'spectator@example.com' : 'member@example.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading}>
            Invite
          </Button>
        </div>
      </div>
      {result?.url && (
        <div className="rounded bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Invite link: <code className="break-all text-xs">{result.url}</code>
        </div>
      )}
      {result?.error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{result.error}</div>
      )}
    </form>
  );
}
