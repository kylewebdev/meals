'use client';

import { updateHouseholdOrder, shuffleHouseholdOrder } from '@/actions/swap-settings';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

interface Household {
  id: string;
  name: string;
}

interface HouseholdOrderListProps {
  orderedHouseholds: Household[];
  allHouseholds: Household[];
  mode: string;
}

export function HouseholdOrderList({
  orderedHouseholds,
  allHouseholds,
  mode,
}: HouseholdOrderListProps) {
  const [items, setItems] = useState(orderedHouseholds);
  const [addId, setAddId] = useState('');
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  const usedIds = new Set(items.map((h) => h.id));
  const unused = allHouseholds.filter((h) => !usedIds.has(h.id));

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
    const hh = allHouseholds.find((h) => h.id === addId);
    if (hh) {
      setItems([...items, hh]);
      setAddId('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setResult(null);
    const res = await updateHouseholdOrder(items.map((h) => h.id));
    if (res.success) {
      setResult({ message: 'Household order saved' });
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  const handleShuffle = async () => {
    setShuffling(true);
    setResult(null);
    const res = await shuffleHouseholdOrder();
    if (res.success) {
      // Reorder local items to match shuffled order
      const orderMap = new Map(items.map((h) => [h.id, h]));
      const shuffled = (res.data as string[])
        .filter((id) => orderMap.has(id))
        .map((id) => orderMap.get(id)!);
      setItems(shuffled);
      setResult({ message: 'Order shuffled' });
    } else {
      setResult({ error: res.error });
    }
    setShuffling(false);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No households in order. Add them below. All households cook every swap day.
        </p>
      ) : (
        <ol className="space-y-1">
          {items.map((hh, idx) => (
            <li
              key={hh.id}
              className="flex items-center gap-2 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <span className="w-6 text-center text-xs text-zinc-400">{idx + 1}</span>
              <span className="flex-1 text-sm font-medium">{hh.name}</span>
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
              <option value="">-- Add household --</option>
              {unused.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
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
        {mode === 'random' && (
          <Button variant="secondary" onClick={handleShuffle} loading={shuffling}>
            Shuffle
          </Button>
        )}
        {result?.message && <span className="text-sm text-green-600">{result.message}</span>}
        {result?.error && <span className="text-sm text-red-600">{result.error}</span>}
      </div>
    </div>
  );
}
