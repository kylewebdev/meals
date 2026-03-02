'use client';

import { updateRotationOrder } from '@/actions/schedule';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Household {
  id: string;
  name: string;
  rotationPosition: number;
  members: { id: string }[];
}

interface RotationEditorProps {
  households: Household[];
}

export function RotationEditor({ households: initial }: RotationEditorProps) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
    setSaved(false);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateRotationOrder(items.map((h) => h.id));
    setLoading(false);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-medium text-zinc-400">{i + 1}</span>
              <span className="font-medium">{h.name}</span>
              <span className="text-sm text-zinc-500">
                ({h.members.length} {h.members.length === 1 ? 'member' : 'members'})
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => moveUp(i)} disabled={i === 0}>
                Up
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveDown(i)}
                disabled={i === items.length - 1}
              >
                Down
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Save Order</Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
