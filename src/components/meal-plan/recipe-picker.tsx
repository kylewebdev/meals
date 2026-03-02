'use client';

import { setMealPlanEntry, removeMealPlanEntry } from '@/actions/meal-plans';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getDayName } from '@/lib/schedule-utils';
import { useState } from 'react';

interface Recipe {
  id: string;
  name: string;
}

interface ExistingEntry {
  id: string;
  dayOfWeek: number;
  mealType: string;
  name: string | null;
  recipeId: string | null;
}

interface RecipePickerProps {
  weekId: string;
  recipes: Recipe[];
  existingEntries: ExistingEntry[];
}

export function RecipePicker({ weekId, recipes, existingEntries }: RecipePickerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => i);
  const mealTypes = ['lunch', 'dinner'] as const;

  const getEntry = (day: number, mealType: string) =>
    existingEntries.find((e) => e.dayOfWeek === day && e.mealType === mealType);

  const handleSelect = async (day: number, mealType: 'lunch' | 'dinner', recipeId: string) => {
    const key = `${day}-${mealType}`;
    setLoading(key);

    const existing = getEntry(day, mealType);
    if (existing) {
      await removeMealPlanEntry(existing.id, weekId);
    }

    if (recipeId) {
      await setMealPlanEntry(weekId, day, mealType, recipeId);
    }
    setLoading(null);
  };

  const handleRemove = async (entryId: string, day: number, mealType: string) => {
    setLoading(`${day}-${mealType}`);
    await removeMealPlanEntry(entryId, weekId);
    setLoading(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[120px_1fr_1fr] gap-3 text-center text-xs font-medium text-zinc-500">
        <div />
        <div>Lunch</div>
        <div>Dinner</div>
      </div>
      {days.map((day) => (
        <div key={day} className="grid grid-cols-[120px_1fr_1fr] gap-3">
          <div className="flex items-center text-sm font-medium">{getDayName(day)}</div>
          {mealTypes.map((mealType) => {
            const entry = getEntry(day, mealType);
            const key = `${day}-${mealType}`;
            const isLoading = loading === key;

            return (
              <div key={mealType} className="flex gap-1">
                <Select
                  value={entry?.recipeId ?? ''}
                  onChange={(e) => handleSelect(day, mealType, e.target.value)}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <option value="">— Select —</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
                {entry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(entry.id, day, mealType)}
                    disabled={isLoading}
                  >
                    X
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
