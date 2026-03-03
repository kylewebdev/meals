'use client';

import { addIngredient, removeIngredient, updateIngredient } from '@/actions/recipes';
import { scaleQuantity } from '@/lib/quantity-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
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
  scaleFactor?: number;
}

export function IngredientTable({
  ingredients,
  recipeId,
  editable,
  scaleFactor,
}: IngredientTableProps) {
  const { toast } = useToast();
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
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({
    name: '', quantity: '', unit: '', calories: '', protein: '', carbs: '', fat: '',
  });
  const [saving, setSaving] = useState(false);

  const startEditingIngredient = (ing: Ingredient) => {
    setEditingIngredientId(ing.id);
    setEditFields({
      name: ing.name,
      quantity: ing.quantity ?? '',
      unit: ing.unit ?? '',
      calories: ing.calories != null ? String(ing.calories) : '',
      protein: ing.proteinG != null ? String(ing.proteinG) : '',
      carbs: ing.carbsG != null ? String(ing.carbsG) : '',
      fat: ing.fatG != null ? String(ing.fatG) : '',
    });
  };

  const cancelEditingIngredient = () => {
    setEditingIngredientId(null);
  };

  const handleSaveIngredient = async (ing: Ingredient) => {
    setSaving(true);
    await updateIngredient(ing.id, recipeId, {
      name: editFields.name,
      quantity: editFields.quantity || undefined,
      unit: editFields.unit || undefined,
      calories: editFields.calories ? parseInt(editFields.calories) : undefined,
      proteinG: editFields.protein ? parseInt(editFields.protein) : undefined,
      carbsG: editFields.carbs ? parseInt(editFields.carbs) : undefined,
      fatG: editFields.fat ? parseInt(editFields.fat) : undefined,
      sortOrder: ing.sortOrder,
    });
    setSaving(false);
    setEditingIngredientId(null);
    toast('Ingredient updated');
  };

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
    toast('Ingredient added');
  };

  const handleRemove = async (ingredientId: string) => {
    setRemovingId(ingredientId);
    await removeIngredient(ingredientId, recipeId);
    setRemovingId(null);
    toast('Ingredient removed');
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="pb-2 font-medium">Ingredient</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Unit</th>
              <th className="hidden pb-2 font-medium md:table-cell">Cal</th>
              <th className="hidden pb-2 font-medium md:table-cell">Protein</th>
              <th className="hidden pb-2 font-medium md:table-cell">Carbs</th>
              <th className="hidden pb-2 font-medium md:table-cell">Fat</th>
              {editable && <th className="pb-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ingredients.map((ing) => {
              const isEditingRow = editingIngredientId === ing.id;
              return isEditingRow ? (
                <tr key={ing.id}>
                  <td className="py-2">
                    <Input
                      value={editFields.name}
                      onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                      className="w-full min-w-0"
                      required
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      value={editFields.quantity}
                      onChange={(e) => setEditFields({ ...editFields, quantity: e.target.value })}
                      className="w-20"
                      placeholder="Qty"
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      value={editFields.unit}
                      onChange={(e) => setEditFields({ ...editFields, unit: e.target.value })}
                      className="w-20"
                      placeholder="Unit"
                    />
                  </td>
                  <td className="hidden py-2 md:table-cell">
                    <Input
                      type="number"
                      value={editFields.calories}
                      onChange={(e) => setEditFields({ ...editFields, calories: e.target.value })}
                      className="w-20"
                      placeholder="Cal"
                    />
                  </td>
                  <td className="hidden py-2 md:table-cell">
                    <Input
                      type="number"
                      value={editFields.protein}
                      onChange={(e) => setEditFields({ ...editFields, protein: e.target.value })}
                      className="w-20"
                      placeholder="g"
                    />
                  </td>
                  <td className="hidden py-2 md:table-cell">
                    <Input
                      type="number"
                      value={editFields.carbs}
                      onChange={(e) => setEditFields({ ...editFields, carbs: e.target.value })}
                      className="w-20"
                      placeholder="g"
                    />
                  </td>
                  <td className="hidden py-2 md:table-cell">
                    <Input
                      type="number"
                      value={editFields.fat}
                      onChange={(e) => setEditFields({ ...editFields, fat: e.target.value })}
                      className="w-20"
                      placeholder="g"
                    />
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={saving}
                        onClick={() => handleSaveIngredient(ing)}
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditingIngredient}>
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={removingId === ing.id}
                        onClick={() => handleRemove(ing.id)}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={ing.id}>
                  <td className="py-2">{ing.name}</td>
                  <td className="py-2 text-zinc-500">
                    {ing.quantity
                      ? scaleFactor
                        ? <>
                            <span className="text-zinc-800 dark:text-zinc-200">
                              {scaleQuantity(ing.quantity, scaleFactor)}
                            </span>
                            {' '}
                            <span className="text-zinc-400 dark:text-zinc-600">
                              ({ing.quantity})
                            </span>
                          </>
                        : ing.quantity
                      : '—'}
                  </td>
                  <td className="py-2 text-zinc-500">{ing.unit ?? '—'}</td>
                  <td className="hidden py-2 text-zinc-500 md:table-cell">{ing.calories ?? '—'}</td>
                  <td className="hidden py-2 text-zinc-500 md:table-cell">{ing.proteinG != null ? `${ing.proteinG}g` : '—'}</td>
                  <td className="hidden py-2 text-zinc-500 md:table-cell">{ing.carbsG != null ? `${ing.carbsG}g` : '—'}</td>
                  <td className="hidden py-2 text-zinc-500 md:table-cell">{ing.fatG != null ? `${ing.fatG}g` : '—'}</td>
                  {editable && (
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingIngredient(ing)}
                      >
                        Edit
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editable && !adding && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setAdding(true)}>
          Add ingredient
        </Button>
      )}

      {editable && adding && (
        <form onSubmit={handleAdd} className="mt-3 space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="min-w-0 flex-1 basis-32"
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
          <div className="flex flex-wrap items-end gap-2">
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
