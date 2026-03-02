import { NutritionSummary } from '@/components/recipe/nutrition-summary';

interface Contribution {
  recipe: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

interface SwapDay {
  contributions: Contribution[];
}

interface WeekNutritionSummaryProps {
  swapDays: SwapDay[];
}

export function WeekNutritionSummary({ swapDays }: WeekNutritionSummaryProps) {
  const allContributions = swapDays.flatMap((sd) => sd.contributions);

  if (allContributions.length === 0) return null;

  const totals = allContributions.reduce(
    (acc, c) => ({
      calories: acc.calories + (c.recipe?.calories ?? 0),
      proteinG: acc.proteinG + (c.recipe?.proteinG ?? 0),
      carbsG: acc.carbsG + (c.recipe?.carbsG ?? 0),
      fatG: acc.fatG + (c.recipe?.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-zinc-500">Weekly Nutrition Total</h3>
      <NutritionSummary
        calories={totals.calories || null}
        proteinG={totals.proteinG || null}
        carbsG={totals.carbsG || null}
        fatG={totals.fatG || null}
      />
    </div>
  );
}
