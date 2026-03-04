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
  const [steps, setSteps] = useState<string[]>(() => {
    const raw = recipe?.instructions ?? '';
    const parsed = raw.split('\n').filter(Boolean);
    return parsed.length > 0 ? parsed : [''];
  });
  const [servings, setServings] = useState(recipe ? recipe.servings?.toString() ?? '' : '');
  const [prepTime, setPrepTime] = useState(recipe ? recipe.prepTimeMinutes?.toString() ?? '' : '');
  const [cookTime, setCookTime] = useState(recipe ? recipe.cookTimeMinutes?.toString() ?? '' : '');
  const [tagsInput, setTagsInput] = useState(recipe ? recipe.tags?.join(', ') ?? '' : '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const recipeId = recipe?.id ?? '';

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
      setImageUrl(publicUrl);
    },
    [recipeId, toast],
  );

  const handleRemoveImage = useCallback(async () => {
    const res = await removeRecipeImage(recipeId);
    if (!res.success) {
      toast(res.error);
      return;
    }
    setImageUrl(null);
  }, [recipeId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const instructions = steps.map((s) => s.trim()).filter(Boolean).join('\n');

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
      ? await updateRecipe(recipeId, data)
      : await createRecipe(data);

    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }

    if (isEdit) {
      toast('Recipe updated');
      router.push(`/recipes/${recipeId}`);
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
        <Label>Instructions</Label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right text-sm text-zinc-400">{i + 1}.</span>
              <Input
                value={step}
                onChange={(e) => {
                  const next = [...steps];
                  next[i] = e.target.value;
                  setSteps(next);
                }}
                placeholder={`Step ${i + 1}`}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                  className="shrink-0 p-1 text-zinc-400 hover:text-red-500"
                  aria-label={`Remove step ${i + 1}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSteps([...steps, ''])}
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            + Add step
          </button>
        </div>
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
