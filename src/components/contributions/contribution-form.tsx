'use client';

import { setContribution, updateContribution, removeContribution } from '@/actions/contributions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/input';
import { useState } from 'react';

interface Recipe {
  id: string;
  name: string;
}

interface ExistingContribution {
  id: string;
  recipeId: string | null;
  dishName: string | null;
  notes: string | null;
  servings: number | null;
}

interface ContributionFormProps {
  weekId: string;
  swapDayId: string;
  swapDayLabel: string;
  recipes: Recipe[];
  existing?: ExistingContribution;
}

export function ContributionForm({
  weekId,
  swapDayId,
  swapDayLabel,
  recipes,
  existing,
}: ContributionFormProps) {
  const [recipeId, setRecipeId] = useState(existing?.recipeId ?? '');
  const [dishName, setDishName] = useState(existing?.dishName ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [servings, setServings] = useState(existing?.servings?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    let res;
    if (existing) {
      res = await updateContribution(existing.id, {
        recipeId: recipeId || null,
        dishName: dishName || undefined,
        notes: notes || undefined,
        servings: servings ? parseInt(servings) : undefined,
      });
    } else {
      res = await setContribution(
        weekId,
        swapDayId,
        recipeId || undefined,
        dishName || undefined,
        notes || undefined,
        servings ? parseInt(servings) : undefined,
      );
    }

    if (res.success) {
      setResult({ message: existing ? 'Updated!' : 'Contribution posted!' });
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!existing) return;
    setRemoving(true);
    setResult(null);
    const res = await removeContribution(existing.id);
    if (res.success) {
      setResult({ message: 'Removed' });
      setRecipeId('');
      setDishName('');
      setNotes('');
      setServings('');
    } else {
      setResult({ error: res.error });
    }
    setRemoving(false);
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h4 className="text-sm font-semibold">{swapDayLabel}</h4>

      <div>
        <Label htmlFor={`recipe-${swapDayId}`}>Recipe (optional)</Label>
        <Select
          id={`recipe-${swapDayId}`}
          value={recipeId}
          onChange={(e) => { setRecipeId(e.target.value); setResult(null); }}
        >
          <option value="">— Select a recipe —</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor={`dish-${swapDayId}`}>Dish name</Label>
        <Input
          id={`dish-${swapDayId}`}
          value={dishName}
          onChange={(e) => { setDishName(e.target.value); setResult(null); }}
          placeholder="e.g., Chicken Tikka Masala"
        />
      </div>

      <div>
        <Label htmlFor={`servings-${swapDayId}`}>Servings</Label>
        <Input
          id={`servings-${swapDayId}`}
          type="number"
          min="1"
          value={servings}
          onChange={(e) => { setServings(e.target.value); setResult(null); }}
          placeholder="Number of servings"
          className="w-32"
        />
      </div>

      <div>
        <Label htmlFor={`notes-${swapDayId}`}>Notes</Label>
        <Textarea
          id={`notes-${swapDayId}`}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setResult(null); }}
          placeholder="Modifications, allergen info, etc."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} loading={loading}>
          {existing ? 'Update' : 'Post Contribution'}
        </Button>
        {existing && (
          <Button variant="ghost" onClick={handleRemove} loading={removing}>
            Remove
          </Button>
        )}
        {result?.message && (
          <span className="text-sm text-green-600">{result.message}</span>
        )}
        {result?.error && (
          <span className="text-sm text-red-600">{result.error}</span>
        )}
      </div>
    </div>
  );
}
