'use client';

import { deleteRecipe } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteRecipeButtonProps {
  recipeId: string;
}

export function DeleteRecipeButton({ recipeId }: DeleteRecipeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    setLoading(true);
    await deleteRecipe(recipeId);
    router.push('/recipes');
  };

  return (
    <Button variant="destructive" loading={loading} onClick={handleDelete}>
      Delete
    </Button>
  );
}
