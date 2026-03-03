'use client';

import { removeMember } from '@/actions/members';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
  portionsPerMeal: number;
}

interface MemberListProps {
  members: Member[];
  householdId: string;
  headId: string | null;
  canManage: boolean;
  currentUserId: string;
}

export function MemberList({ members, householdId, headId, canManage, currentUserId }: MemberListProps) {
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    setRemoving(userId);
    await removeMember(userId, householdId);
    setRemoving(null);
    toast('Member removed');
  };

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.name}</span>
              <Badge variant="outline" className="border-0">
                {member.portionsPerMeal} {member.portionsPerMeal === 1 ? 'portion' : 'portions'}
              </Badge>
              {member.id === headId && (
                <Badge variant="success">Head</Badge>
              )}
              {member.role === 'admin' && (
                <Badge>Admin</Badge>
              )}
            </div>
            <span className="text-sm text-zinc-500">{member.email}</span>
          </div>
          {canManage && member.id !== currentUserId && (
            <Button
              variant="destructive"
              size="sm"
              loading={removing === member.id}
              onClick={() => handleRemove(member.id)}
            >
              Remove
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
