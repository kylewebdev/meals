'use client';

import { addExtraPerson, removeExtraPerson, updateExtraPerson } from '@/actions/extra-people';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const PORTION_OPTIONS = [0, 1, 2, 3] as const;

interface ExtraPerson {
  id: string;
  name: string;
  portions: number;
}

interface ExtraPeopleFormProps {
  householdId: string;
  extraPeople: ExtraPerson[];
}

export function ExtraPeopleForm({ householdId, extraPeople: initial }: ExtraPeopleFormProps) {
  const [people, setPeople] = useState<ExtraPerson[]>(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAdd = async () => {
    setLoading('add');
    const res = await addExtraPerson(householdId, 'New person', 1);
    if (res.success) {
      setPeople((prev) => [...prev, res.data]);
      toast('Person added');
    }
    setLoading(null);
  };

  const handlePortionChange = async (id: string, portions: number) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, portions } : p)));
    setLoading(id);
    const res = await updateExtraPerson(id, { portions });
    if (!res.success) {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, portions: initial.find((i) => i.id === id)?.portions ?? p.portions } : p)));
    } else {
      toast('Portions updated');
    }
    setLoading(null);
  };

  const handleNameBlur = async (id: string, name: string) => {
    const current = people.find((p) => p.id === id);
    if (!current || current.name === name) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name: current.name } : p)));
      return;
    }

    setLoading(id);
    const res = await updateExtraPerson(id, { name: trimmed });
    if (res.success) {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
      toast('Name updated');
    }
    setLoading(null);
  };

  const handleRemove = async (id: string) => {
    setLoading(id);
    const res = await removeExtraPerson(id);
    if (res.success) {
      setPeople((prev) => prev.filter((p) => p.id !== id));
      toast('Person removed');
    }
    setLoading(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Extra people in your household who aren&apos;t app users (e.g. kids).
      </p>

      {people.length > 0 && (
        <div className="space-y-2">
          {people.map((person) => (
            <div key={person.id} className="flex items-center gap-2">
              <Input
                defaultValue={person.name}
                onBlur={(e) => handleNameBlur(person.id, e.target.value)}
                className="h-8 flex-1 text-sm"
                disabled={loading === person.id}
              />
              <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                {PORTION_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={loading === person.id}
                    onClick={() => handlePortionChange(person.id, n)}
                    className={cn(
                      'px-3 py-1 text-sm font-medium transition-colors',
                      'disabled:cursor-not-allowed',
                      'not-first:border-l not-first:border-zinc-300 dark:not-first:border-zinc-700',
                      n === person.portions
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(person.id)}
                disabled={loading === person.id}
                className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label={`Remove ${person.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading === 'add'}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        + Add person
      </button>
    </div>
  );
}
