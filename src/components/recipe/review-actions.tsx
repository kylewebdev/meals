'use client';

import { reviewRecipe } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReviewActionsProps {
  recipeId: string;
}

export function ReviewActions({ recipeId }: ReviewActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    const res = await reviewRecipe(recipeId, 'approve');
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.refresh();
  };

  const handleReject = async () => {
    setLoading(true);
    setError('');
    const res = await reviewRecipe(recipeId, 'reject', feedback || undefined);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {!showReject ? (
        <div className="flex gap-2">
          <Button loading={loading} onClick={handleApprove}>
            Approve
          </Button>
          <Button variant="destructive" onClick={() => setShowReject(true)}>
            Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback for the submitter (optional)"
          />
          <div className="flex gap-2">
            <Button variant="destructive" loading={loading} onClick={handleReject}>
              Confirm Reject
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowReject(false);
                setFeedback('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
