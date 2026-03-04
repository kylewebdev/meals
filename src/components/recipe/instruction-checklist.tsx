'use client';

import { useState } from 'react';

interface InstructionChecklistProps {
  instructions: string;
}

export function InstructionChecklist({ instructions }: InstructionChecklistProps) {
  const steps = instructions.split('\n').filter(Boolean);
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Single step: render as plain paragraph (no checklist)
  if (steps.length <= 1) {
    return (
      <p className="font-serif text-base leading-relaxed">{steps[0]}</p>
    );
  }

  return (
    <div>
      {done.size > 0 && (
        <p className="mb-3 text-sm font-medium text-zinc-500">
          {done.size} of {steps.length} steps done
        </p>
      )}
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {steps.map((step, i) => {
          const checked = done.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-3 py-3 text-left transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span className="mt-0.5 shrink-0 text-sm font-medium text-zinc-400">
                  {i + 1}.
                </span>
                <span
                  className={`font-serif text-base leading-relaxed transition-colors ${
                    checked
                      ? 'text-zinc-400 line-through opacity-50 dark:text-zinc-600'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {step}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
