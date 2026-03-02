'use client';

import { rateRecipe } from '@/actions/ratings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RatingWidgetProps {
  recipeId: string;
  currentRating?: 'love' | 'fine' | 'dislike' | null;
  currentComment?: string | null;
}

const ratingOptions = [
  { value: 'love' as const, label: 'Love', activeClass: 'bg-green-600 text-white' },
  { value: 'fine' as const, label: 'Fine', activeClass: 'bg-zinc-600 text-white' },
  { value: 'dislike' as const, label: 'Dislike', activeClass: 'bg-red-600 text-white' },
];

export function RatingWidget({ recipeId, currentRating, currentComment }: RatingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<'love' | 'fine' | 'dislike' | null>(
    currentRating ?? null,
  );
  const [showComment, setShowComment] = useState(!!currentComment);
  const [comment, setComment] = useState(currentComment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRate = async (rating: 'love' | 'fine' | 'dislike') => {
    setSelected(rating);
    setLoading(true);
    setError('');
    const res = await rateRecipe(recipeId, rating, comment || undefined);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast('Rating saved');
    router.refresh();
  };

  const handleCommentSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    const res = await rateRecipe(recipeId, selected, comment || undefined);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast('Rating saved');
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="flex gap-2">
        {ratingOptions.map((opt) => (
          <Button
            key={opt.value}
            variant="secondary"
            size="sm"
            loading={loading && selected === opt.value}
            disabled={loading}
            className={selected === opt.value ? opt.activeClass : ''}
            onClick={() => handleRate(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {selected && !showComment && (
        <button
          className="text-xs text-zinc-500 hover:text-zinc-700"
          onClick={() => setShowComment(true)}
        >
          Add a comment
        </button>
      )}

      {showComment && (
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment (max 500 chars)"
            maxLength={500}
            className="min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button size="sm" loading={loading} disabled={!selected} onClick={handleCommentSubmit}>
              Save Comment
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowComment(false);
                setComment('');
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
