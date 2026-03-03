'use client';

import { createRecipe, updateRecipe } from '@/actions/recipes';
import { getUploadUrl, updateRecipeImage, removeRecipeImage } from '@/actions/uploads';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface RecipeFormProps {
  recipe?: {
    id: string;
    name: string;
    description: string | null;
    instructions: string | null;
    servings: number | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    tags: string[] | null;
    imageUrl: string | null;
  };
  isAdmin?: boolean;
}

export function RecipeForm({ recipe, isAdmin = false }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!recipe;

  const [name, setName] = useState(recipe?.name ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '');
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? '');
  const [prepTime, setPrepTime] = useState(recipe?.prepTimeMinutes?.toString() ?? '');
  const [cookTime, setCookTime] = useState(recipe?.cookTimeMinutes?.toString() ?? '');
  const [tagsInput, setTagsInput] = useState(recipe?.tags?.join(', ') ?? '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetUploadUrl = useCallback(
    (file: { fileType: string; fileSize: number }) =>
      getUploadUrl({ recipeId: recipe!.id, ...file }),
    [recipe],
  );

  const handleUploadComplete = useCallback(
    async (publicUrl: string) => {
      const res = await updateRecipeImage(recipe!.id, publicUrl);
      if (!res.success) {
        toast(res.error);
        return;
      }
      setImageUrl(publicUrl);
    },
    [recipe, toast],
  );

  const handleRemoveImage = useCallback(async () => {
    const res = await removeRecipeImage(recipe!.id);
    if (!res.success) {
      toast(res.error);
      return;
    }
    setImageUrl(null);
  }, [recipe, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const data = {
      name,
      description: description || undefined,
      instructions: instructions || undefined,
      servings: servings ? parseInt(servings) : undefined,
      prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
      cookTimeMinutes: cookTime ? parseInt(cookTime) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      imageUrl: imageUrl || undefined,
    };

    const res = isEdit
      ? await updateRecipe(recipe.id, data)
      : await createRecipe(data);

    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }

    if (isEdit) {
      toast('Recipe updated');
      router.push(`/recipes/${recipe.id}`);
    } else if (isAdmin) {
      toast('Recipe created');
      router.push(`/recipes/${res.data!.id}`);
    } else {
      toast('Recipe submitted for review');
      router.push('/recipes/mine');
    }
  };

  const submitLabel = isEdit
    ? 'Save Changes'
    : isAdmin
      ? 'Create Recipe'
      : 'Submit for Review';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div>
        <Label htmlFor="recipe-name">Name</Label>
        <Input id="recipe-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="recipe-description">Description</Label>
        <Textarea
          id="recipe-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the recipe"
        />
      </div>

      <div>
        <Label htmlFor="recipe-instructions">Instructions</Label>
        <Textarea
          id="recipe-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step-by-step cooking instructions"
          className="min-h-[160px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="recipe-servings">Servings</Label>
          <Input
            id="recipe-servings"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipe-prep">Prep time (min)</Label>
          <Input
            id="recipe-prep"
            type="number"
            min="0"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipe-cook">Cook time (min)</Label>
          <Input
            id="recipe-cook"
            type="number"
            min="0"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="recipe-tags">Tags (comma-separated)</Label>
        <Input
          id="recipe-tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="italian, pasta, quick"
        />
      </div>

      {isEdit && (
        <div>
          <Label>Image</Label>
          <div className="mt-1">
            <ImageUpload
              currentImageUrl={imageUrl}
              getUploadUrl={handleGetUploadUrl}
              onUploadComplete={handleUploadComplete}
              onRemove={handleRemoveImage}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
