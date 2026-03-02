'use client';

import { updateDietaryProfile } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { ALLERGY_OPTIONS, PREFERENCE_OPTIONS } from '@/lib/dietary-options';
import { useState } from 'react';

interface DietaryFormProps {
  allergies: string[];
  preferences: string[];
  notes: string;
}

export function DietaryForm({ allergies: initAllergies, preferences: initPrefs, notes: initNotes }: DietaryFormProps) {
  const [allergies, setAllergies] = useState<Set<string>>(new Set(initAllergies));
  const [preferences, setPreferences] = useState<Set<string>>(new Set(initPrefs));
  const [notes, setNotes] = useState(initNotes);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleItem = (set: Set<string>, setter: (s: Set<string>) => void, item: string) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setter(next);
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    await updateDietaryProfile({
      allergies: Array.from(allergies),
      dietaryPreferences: Array.from(preferences),
      dietaryNotes: notes,
    });
    setLoading(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Allergies</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleItem(allergies, setAllergies, option)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                allergies.has(option)
                  ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Dietary Preferences</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleItem(preferences, setPreferences, option)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                preferences.has(option)
                  ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="dietary-notes">Additional notes</Label>
        <Textarea
          id="dietary-notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          placeholder="Any other dietary needs or preferences..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Dietary Profile</Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
