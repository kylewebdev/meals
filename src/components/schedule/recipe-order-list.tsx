'use client';

import { updateRecipeOrder } from '@/actions/swap-settings';
import { recalculateWeekAssignments } from '@/actions/schedule';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

interface Recipe {
  id: string;
  name: string;
}

interface RecipeOrderListProps {
  orderedRecipes: Recipe[];
  availableRecipes: Recipe[];
}

export function RecipeOrderList({ orderedRecipes, availableRecipes }: RecipeOrderListProps) {
  const [items, setItems] = useState(orderedRecipes);
  const [addId, setAddId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  const usedIds = new Set(items.map((r) => r.id));
  const unused = availableRecipes.filter((r) => !usedIds.has(r.id));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next);
  };

  const remove = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const add = () => {
    if (!addId) return;
    const recipe = availableRecipes.find((r) => r.id === addId);
    if (recipe) {
      setItems([...items, recipe]);
      setAddId('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setResult(null);
    const res = await updateRecipeOrder(items.map((r) => r.id));
    if (res.success) {
      const recalc = await recalculateWeekAssignments();
      if (recalc.success) {
        setResult({ message: 'Recipe order saved and future weeks updated' });
      } else {
        setResult({ message: 'Recipe order saved', error: recalc.error });
      }
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No recipes in rotation. Add some below.</p>
      ) : (
        <ol className="space-y-1">
          {items.map((recipe, idx) => (
            <li
              key={recipe.id}
              className="flex items-center gap-2 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <span className="w-6 text-center text-xs text-zinc-400">{idx + 1}</span>
              <span className="flex-1 text-sm font-medium">{recipe.name}</span>
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                aria-label="Move up"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === items.length - 1}
                className="px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                aria-label="Move down"
              >
                &darr;
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="px-1 text-red-400 hover:text-red-600"
                aria-label="Remove"
              >
                &times;
              </button>
            </li>
          ))}
        </ol>
      )}

      {unused.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select value={addId} onChange={(e) => setAddId(e.target.value)}>
              <option value="">-- Add recipe --</option>
              {unused.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" size="sm" onClick={add} disabled={!addId}>
            Add
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Order</Button>
        {result?.message && <span className="text-sm text-green-600">{result.message}</span>}
        {result?.error && <span className="text-sm text-red-600">{result.error}</span>}
      </div>
    </div>
  );
}
