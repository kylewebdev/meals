'use client';

import { addIngredient, removeIngredient, updateIngredient } from '@/actions/recipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  sortOrder: number;
}

interface IngredientTableProps {
  ingredients: Ingredient[];
  recipeId: string;
  editable: boolean;
}

export function IngredientTable({ ingredients, recipeId, editable }: IngredientTableProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addIngredient(recipeId, {
      name: newName,
      quantity: newQuantity || undefined,
      unit: newUnit || undefined,
      calories: newCalories ? parseInt(newCalories) : undefined,
      sortOrder: ingredients.length,
    });
    setNewName('');
    setNewQuantity('');
    setNewUnit('');
    setNewCalories('');
    setAdding(false);
    setLoading(false);
  };

  const handleRemove = async (ingredientId: string) => {
    setRemovingId(ingredientId);
    await removeIngredient(ingredientId, recipeId);
    setRemovingId(null);
  };

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="pb-2 font-medium">Ingredient</th>
            <th className="pb-2 font-medium">Qty</th>
            <th className="pb-2 font-medium">Unit</th>
            <th className="pb-2 font-medium">Cal</th>
            {editable && <th className="pb-2" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {ingredients.map((ing) => (
            <tr key={ing.id}>
              <td className="py-2">{ing.name}</td>
              <td className="py-2 text-zinc-500">{ing.quantity ?? '—'}</td>
              <td className="py-2 text-zinc-500">{ing.unit ?? '—'}</td>
              <td className="py-2 text-zinc-500">{ing.calories ?? '—'}</td>
              {editable && (
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={removingId === ing.id}
                    onClick={() => handleRemove(ing.id)}
                  >
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {editable && !adding && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setAdding(true)}>
          Add ingredient
        </Button>
      )}

      {editable && adding && (
        <form onSubmit={handleAdd} className="mt-3 flex items-end gap-2">
          <Input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="flex-1"
          />
          <Input
            placeholder="Qty"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-20"
          />
          <Input
            placeholder="Unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="w-20"
          />
          <Input
            placeholder="Cal"
            type="number"
            value={newCalories}
            onChange={(e) => setNewCalories(e.target.value)}
            className="w-20"
          />
          <Button type="submit" size="sm" loading={loading}>Add</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
