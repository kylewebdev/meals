import { NutritionSummary } from '@/components/recipe/nutrition-summary';

interface MealEntry {
  isModified: boolean;
  modifiedCalories: number | null;
  modifiedProteinG: number | null;
  modifiedCarbsG: number | null;
  modifiedFatG: number | null;
  recipe: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

interface WeekNutritionSummaryProps {
  entries: MealEntry[];
}

export function WeekNutritionSummary({ entries }: WeekNutritionSummaryProps) {
  const totals = entries.reduce(
    (acc, e) => {
      const cal = e.isModified ? e.modifiedCalories : e.recipe?.calories;
      const pro = e.isModified ? e.modifiedProteinG : e.recipe?.proteinG;
      const carb = e.isModified ? e.modifiedCarbsG : e.recipe?.carbsG;
      const fat = e.isModified ? e.modifiedFatG : e.recipe?.fatG;
      return {
        calories: acc.calories + (cal ?? 0),
        proteinG: acc.proteinG + (pro ?? 0),
        carbsG: acc.carbsG + (carb ?? 0),
        fatG: acc.fatG + (fat ?? 0),
      };
    },
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
