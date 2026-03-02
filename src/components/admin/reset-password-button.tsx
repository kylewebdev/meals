'use client';

import { adminResetPassword } from '@/actions/members';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

interface ResetPasswordButtonProps {
  userId: string;
  userName: string;
}

export function ResetPasswordButton({ userId, userName }: ResetPasswordButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    setPending(true);
    setError('');
    const result = await adminResetPassword(userId);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setTempPassword(result.data.tempPassword);
  }

  function handleClose() {
    setOpen(false);
    setTempPassword(null);
    setError('');
    setCopied(false);
  }

  async function handleCopy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Reset Password
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>
            {tempPassword ? 'Temporary Password' : 'Reset Password'}
          </DialogTitle>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Send this temporary password to <strong>{userName}</strong>.
              They should change it after logging in.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-zinc-100 px-3 py-2 font-mono text-sm dark:bg-zinc-800">
                {tempPassword}
              </code>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              This will generate a random temporary password for{' '}
              <strong>{userName}</strong>. You&apos;ll need to send it to them so they
              can log in and change it.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <DialogFooter>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleReset} loading={pending}>
                Generate Password
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </>
  );
}
