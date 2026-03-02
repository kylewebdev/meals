'use client';

import { updateModification, clearModification } from '@/actions/meal-plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { useState } from 'react';

interface ModificationFormProps {
  entryId: string;
  weekId: string;
  currentNotes: string | null;
  currentCalories: number | null;
  currentProteinG: number | null;
  currentCarbsG: number | null;
  currentFatG: number | null;
  isModified: boolean;
}

export function ModificationForm({
  entryId,
  weekId,
  currentNotes,
  currentCalories,
  currentProteinG,
  currentCarbsG,
  currentFatG,
  isModified,
}: ModificationFormProps) {
  const [notes, setNotes] = useState(currentNotes ?? '');
  const [calories, setCalories] = useState(currentCalories?.toString() ?? '');
  const [proteinG, setProteinG] = useState(currentProteinG?.toString() ?? '');
  const [carbsG, setCarbsG] = useState(currentCarbsG?.toString() ?? '');
  const [fatG, setFatG] = useState(currentFatG?.toString() ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updateModification(entryId, weekId, {
      notes: notes || undefined,
      calories: calories ? parseInt(calories) : undefined,
      proteinG: proteinG ? parseInt(proteinG) : undefined,
      carbsG: carbsG ? parseInt(carbsG) : undefined,
      fatG: fatG ? parseInt(fatG) : undefined,
    });
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    await clearModification(entryId, weekId);
    setNotes('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setLoading(false);
  };

  return (
    <div className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h4 className="text-sm font-medium">Modification Notes</h4>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="How is this different from the recipe?"
        className="min-h-[60px]"
      />
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">Calories</Label>
          <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Protein (g)</Label>
          <Input type="number" value={proteinG} onChange={(e) => setProteinG(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Carbs (g)</Label>
          <Input type="number" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Fat (g)</Label>
          <Input type="number" value={fatG} onChange={(e) => setFatG(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} loading={loading}>Save Modification</Button>
        {isModified && (
          <Button size="sm" variant="ghost" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
