import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ContributionCardProps {
  householdName: string;
  dishName: string | null;
  recipeId: string | null;
  recipeName: string | null;
  notes: string | null;
  servings: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export function ContributionCard({
  householdName,
  dishName,
  recipeId,
  recipeName,
  notes,
  servings,
  calories,
  proteinG,
  carbsG,
  fatG,
}: ContributionCardProps) {
  const displayName = dishName || recipeName || 'Untitled dish';

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold">{householdName}</p>
          <p className="text-sm">
            {recipeId ? (
              <Link
                href={`/recipes/${recipeId}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {displayName}
              </Link>
            ) : (
              displayName
            )}
          </p>
          {notes && (
            <p className="text-sm text-zinc-500">{notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {servings && (
            <Badge variant="outline">{servings} servings</Badge>
          )}
        </div>
      </div>
      {(calories || proteinG || carbsG || fatG) && (
        <div className="mt-3 flex gap-4 text-xs text-zinc-500">
          {calories && <span>{calories} cal</span>}
          {proteinG && <span>{proteinG}g protein</span>}
          {carbsG && <span>{carbsG}g carbs</span>}
          {fatG && <span>{fatG}g fat</span>}
        </div>
      )}
    </div>
  );
}
