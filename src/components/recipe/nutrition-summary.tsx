interface NutritionSummaryProps {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export function NutritionSummary({ calories, proteinG, carbsG, fatG }: NutritionSummaryProps) {
  const hasData = calories || proteinG || carbsG || fatG;
  if (!hasData) return null;

  return (
    <div className="grid grid-cols-4 gap-4 rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-900">
      <div>
        <p className="text-lg font-semibold">{calories ?? '—'}</p>
        <p className="text-xs text-zinc-500">Calories</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{proteinG ?? '—'}g</p>
        <p className="text-xs text-zinc-500">Protein</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{carbsG ?? '—'}g</p>
        <p className="text-xs text-zinc-500">Carbs</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{fatG ?? '—'}g</p>
        <p className="text-xs text-zinc-500">Fat</p>
      </div>
    </div>
  );
}
