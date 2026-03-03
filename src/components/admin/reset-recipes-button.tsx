'use client';

import { resetAllRecipes } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

export function ResetRecipesButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    setPending(true);
    setError('');
    const result = await resetAllRecipes();
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    toast(`Deleted ${result.data.deleted} recipe(s)`);
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Reset All Recipes
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Reset All Recipes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This will permanently delete <strong>every recipe</strong> in the
            system, along with their ingredients, ratings, and comments.
            Contributions will be unlinked and the rotation recipe order will be
            cleared.
          </p>
          <p className="text-sm font-medium text-red-600">
            This action cannot be undone.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset} loading={pending}>
              Delete All Recipes
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
