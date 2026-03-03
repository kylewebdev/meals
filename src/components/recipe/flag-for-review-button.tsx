'use client';

import { flagForReview } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FlagForReviewButtonProps {
  recipeId: string;
}

export function FlagForReviewButton({ recipeId }: FlagForReviewButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFlag = async () => {
    setLoading(true);
    const res = await flagForReview(recipeId);
    if (!res.success) {
      toast(res.error, 'error');
      setLoading(false);
      return;
    }
    toast('Recipe flagged for admin review');
    router.refresh();
  };

  return (
    <Button variant="secondary" loading={loading} onClick={handleFlag}>
      Flag for Review
    </Button>
  );
}
