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
  const [newProtein, setNewProtein] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newFat, setNewFat] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const resetForm = () => {
    setNewName('');
    setNewQuantity('');
    setNewUnit('');
    setNewCalories('');
    setNewProtein('');
    setNewCarbs('');
    setNewFat('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addIngredient(recipeId, {
      name: newName,
      quantity: newQuantity || undefined,
      unit: newUnit || undefined,
      calories: newCalories ? parseInt(newCalories) : undefined,
      proteinG: newProtein ? parseInt(newProtein) : undefined,
      carbsG: newCarbs ? parseInt(newCarbs) : undefined,
      fatG: newFat ? parseInt(newFat) : undefined,
      sortOrder: ingredients.length,
    });
    resetForm();
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
            <th className="pb-2 font-medium">Protein</th>
            <th className="pb-2 font-medium">Carbs</th>
            <th className="pb-2 font-medium">Fat</th>
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
              <td className="py-2 text-zinc-500">{ing.proteinG != null ? `${ing.proteinG}g` : '—'}</td>
              <td className="py-2 text-zinc-500">{ing.carbsG != null ? `${ing.carbsG}g` : '—'}</td>
              <td className="py-2 text-zinc-500">{ing.fatG != null ? `${ing.fatG}g` : '—'}</td>
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
        <form onSubmit={handleAdd} className="mt-3 space-y-2">
          <div className="flex items-end gap-2">
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
          </div>
          <div className="flex items-end gap-2">
            <Input
              placeholder="Cal"
              type="number"
              value={newCalories}
              onChange={(e) => setNewCalories(e.target.value)}
              className="w-20"
            />
            <Input
              placeholder="Protein (g)"
              type="number"
              value={newProtein}
              onChange={(e) => setNewProtein(e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Carbs (g)"
              type="number"
              value={newCarbs}
              onChange={(e) => setNewCarbs(e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Fat (g)"
              type="number"
              value={newFat}
              onChange={(e) => setNewFat(e.target.value)}
              className="w-20"
            />
            <Button type="submit" size="sm" loading={loading}>Add</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { resetForm(); setAdding(false); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
