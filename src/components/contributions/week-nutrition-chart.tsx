'use client';

import dynamic from 'next/dynamic';

const NutritionChart = dynamic(
  () => import('@/components/recipe/nutrition-chart').then((m) => m.NutritionChart),
  { ssr: false },
);

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

interface WeekNutritionChartProps {
  swapDays: SwapDay[];
}

export function WeekNutritionChart({ swapDays }: WeekNutritionChartProps) {
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
    <NutritionChart
      calories={totals.calories}
      proteinG={totals.proteinG}
      carbsG={totals.carbsG}
      fatG={totals.fatG}
    />
  );
}
