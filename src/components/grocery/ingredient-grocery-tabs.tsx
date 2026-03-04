'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLenis } from 'lenis/react';
import { cn } from '@/lib/utils';

interface IngredientGroceryTabsProps {
  ingredientsContent: ReactNode;
  groceryContent: ReactNode;
  defaultTab?: 'ingredients' | 'grocery';
}

export function IngredientGroceryTabs({
  ingredientsContent,
  groceryContent,
  defaultTab = 'ingredients',
}: IngredientGroceryTabsProps) {
  const [tab, setTab] = useState<'ingredients' | 'grocery'>(defaultTab);
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (defaultTab === 'grocery' && ref.current && lenis) {
      lenis.scrollTo(ref.current, { offset: -80 });
    }
  }, [defaultTab, lenis]);

  return (
    <div ref={ref}>
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setTab('ingredients')}
          className={cn(
            'px-4 py-2.5 text-lg font-semibold transition-colors',
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
            'px-4 py-2.5 text-lg font-semibold transition-colors',
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
