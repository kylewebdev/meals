'use client';

import { reviewRecipe } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReviewActionsProps {
  recipeId: string;
  currentStatus: 'pending_review' | 'approved';
}

export function ReviewActions({ recipeId, currentStatus }: ReviewActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
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
    toast('Recipe approved');
    router.refresh();
  };

  const handleSendBack = async () => {
    setLoading(true);
    setError('');
    const res = await reviewRecipe(recipeId, 'send_back', feedback || undefined);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    toast('Recipe sent back to workshop');
    router.refresh();
  };

  const handleDemote = async () => {
    setLoading(true);
    setError('');
    const res = await reviewRecipe(recipeId, 'demote', feedback || undefined);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    toast('Recipe moved back to workshop');
    router.refresh();
  };

  if (currentStatus === 'approved') {
    return (
      <div className="space-y-3">
        {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {!showFeedback ? (
          <Button variant="secondary" onClick={() => setShowFeedback(true)}>
            Demote to Workshop
          </Button>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Reason for demoting (optional)"
            />
            <div className="flex gap-2">
              <Button variant="destructive" loading={loading} onClick={handleDemote}>
                Confirm Demote
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowFeedback(false);
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

  return (
    <div className="space-y-3">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {!showFeedback ? (
        <div className="flex gap-2">
          <Button loading={loading} onClick={handleApprove}>
            Approve
          </Button>
          <Button variant="secondary" onClick={() => setShowFeedback(true)}>
            Send Back
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
            <Button variant="secondary" loading={loading} onClick={handleSendBack}>
              Confirm Send Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowFeedback(false);
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
