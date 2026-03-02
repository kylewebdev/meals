'use client';

import { toggleGroceryItem, resyncGroceryList } from '@/actions/grocery';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useOptimistic, useState, useTransition } from 'react';

interface GroceryItemData {
  id: string;
  ingredientName: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
  sortOrder: number;
}

interface GroceryListTabProps {
  listId: string;
  items: GroceryItemData[];
}

function formatLine(item: GroceryItemData): string {
  const parts: string[] = [];
  if (item.quantity) parts.push(item.quantity);
  if (item.unit) parts.push(item.unit);
  parts.push(item.ingredientName);
  return parts.join(' ');
}

function sortItems(items: GroceryItemData[]): GroceryItemData[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.sortOrder - b.sortOrder;
  });
}

export function GroceryListTab({ listId, items: initialItems }: GroceryListTabProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [syncing, startSync] = useTransition();

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const sorted = sortItems(items);

  const handleToggle = async (itemId: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    );

    const result = await toggleGroceryItem(itemId);
    if (!result.success) {
      // Revert
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
      );
      toast('Failed to update item', 'error');
    }
  };

  const handleResync = () => {
    startSync(async () => {
      const result = await resyncGroceryList(listId);
      if (result.success) {
        toast('Grocery list refreshed');
        // Force a page refresh to get new items from server
        window.location.reload();
      } else {
        toast('Failed to refresh list', 'error');
      }
    });
  };

  if (totalCount === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-500">
        No ingredients to show.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">
          {checkedCount} of {totalCount} items
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResync}
          loading={syncing}
        >
          Re-sync
        </Button>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sorted.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              className="flex w-full items-center gap-3 py-3 text-left transition-colors active:bg-zinc-50 dark:active:bg-zinc-900"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  item.checked
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              >
                {item.checked && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm transition-colors ${
                  item.checked
                    ? 'text-zinc-400 line-through dark:text-zinc-600'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {formatLine(item)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
