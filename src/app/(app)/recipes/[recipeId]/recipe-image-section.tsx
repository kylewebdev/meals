'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageUpload } from '@/components/ui/image-upload';
import { getUploadUrl, updateRecipeImage, removeRecipeImage } from '@/actions/uploads';
import { useToast } from '@/components/ui/toast';
import { useCallback } from 'react';

interface RecipeImageSectionProps {
  recipeId: string;
  imageUrl: string | null;
  canEdit: boolean;
}

export function RecipeImageSection({ recipeId, imageUrl, canEdit }: RecipeImageSectionProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleGetUploadUrl = useCallback(
    (file: { fileType: string; fileSize: number }) =>
      getUploadUrl({ recipeId, ...file }),
    [recipeId],
  );

  const handleUploadComplete = useCallback(
    async (publicUrl: string) => {
      const res = await updateRecipeImage(recipeId, publicUrl);
      if (!res.success) {
        toast(res.error);
        return;
      }
      router.refresh();
    },
    [recipeId, router, toast],
  );

  const handleRemove = useCallback(async () => {
    const res = await removeRecipeImage(recipeId);
    if (!res.success) {
      toast(res.error);
      return;
    }
    router.refresh();
  }, [recipeId, router, toast]);

  if (!canEdit && !imageUrl) return null;

  if (!canEdit && imageUrl) {
    return (
      <div className="relative aspect-4/3 overflow-hidden rounded-lg">
        <Image src={imageUrl} alt="Recipe image" fill sizes="(min-width: 768px) 50vw, 100vw" priority className="object-cover" />
      </div>
    );
  }

  return (
    <ImageUpload
      currentImageUrl={imageUrl}
      getUploadUrl={handleGetUploadUrl}
      onUploadComplete={handleUploadComplete}
      onRemove={imageUrl ? handleRemove : undefined}
    />
  );
}
