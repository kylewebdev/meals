import { cn } from '@/lib/utils';

interface NutritionSummaryProps {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  scaleFactor?: number;
  className?: string;
}

function scale(value: number | null, factor?: number): string {
  if (value == null) return '—';
  if (!factor || factor === 1) return String(value);
  return String(Math.round(value * factor));
}

export function NutritionSummary({ calories, proteinG, carbsG, fatG, scaleFactor, className }: NutritionSummaryProps) {
  const hasData = calories || proteinG || carbsG || fatG;
  if (!hasData) return null;

  return (
    <div className={cn(
      'grid max-w-2xl grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-900',
      className,
    )}>
      <div>
        <p className="text-lg font-semibold">{scale(calories, scaleFactor)}</p>
        <p className="text-xs text-zinc-500">Calories</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{scale(proteinG, scaleFactor)}g</p>
        <p className="text-xs text-zinc-500">Protein</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{scale(carbsG, scaleFactor)}g</p>
        <p className="text-xs text-zinc-500">Carbs</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{scale(fatG, scaleFactor)}g</p>
        <p className="text-xs text-zinc-500">Fat</p>
      </div>
    </div>
  );
}
