'use client';

import { deleteUser } from '@/actions/members';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  isSelf: boolean;
}

export function DeleteUserButton({ userId, userName, isSelf }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setPending(true);
    setError('');
    const result = await deleteUser(userId);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isSelf}
      >
        Remove
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Remove User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to permanently remove{' '}
            <strong>{userName}</strong>? This will delete their account,
            sessions, and notifications. Any recipes they created will be
            transferred to you.
          </p>
          <p className="text-sm font-medium text-red-600">
            This action cannot be undone.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={pending}>
              Remove User
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
