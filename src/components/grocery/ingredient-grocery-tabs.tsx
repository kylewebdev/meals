'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IngredientGroceryTabsProps {
  ingredientsContent: ReactNode;
  groceryContent: ReactNode;
}

export function IngredientGroceryTabs({
  ingredientsContent,
  groceryContent,
}: IngredientGroceryTabsProps) {
  const [tab, setTab] = useState<'ingredients' | 'grocery'>('ingredients');

  return (
    <div>
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setTab('ingredients')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'ingredients'
              ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
        >
          Ingredients
        </button>
        <button
          type="button"
          onClick={() => setTab('grocery')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'grocery'
              ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
        >
          Grocery List
        </button>
      </div>
      <div className="pt-4">
        {tab === 'ingredients' ? ingredientsContent : groceryContent}
      </div>
    </div>
  );
}
