import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface MealSlotProps {
  entry?: {
    id: string;
    name: string | null;
    recipeId: string | null;
    isModified: boolean;
    modificationNotes: string | null;
    recipe: {
      id: string;
      name: string;
      calories: number | null;
    } | null;
  };
  mealType: string;
}

export function MealSlot({ entry, mealType }: MealSlotProps) {
  if (!entry) {
    return (
      <div className="rounded border border-dashed border-zinc-200 p-3 text-center text-sm text-zinc-400 dark:border-zinc-800">
        No {mealType}
      </div>
    );
  }

  const displayName = entry.name ?? entry.recipe?.name ?? 'Unnamed meal';

  return (
    <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          {entry.recipeId ? (
            <Link
              href={`/recipes/${entry.recipeId}`}
              className="text-sm font-medium hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <span className="text-sm font-medium">{displayName}</span>
          )}
          {entry.isModified && (
            <Badge variant="warning" className="ml-2">Modified</Badge>
          )}
        </div>
        {entry.recipe?.calories && (
          <span className="text-xs text-zinc-400">{entry.recipe.calories} cal</span>
        )}
      </div>
      {entry.modificationNotes && (
        <p className="mt-1 text-xs text-zinc-500">{entry.modificationNotes}</p>
      )}
    </div>
  );
}
